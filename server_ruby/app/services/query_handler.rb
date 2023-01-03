
class QueryHandler < ApplicationService
    attr_reader :table,  :loader, :associations
    attr_reader :query_model, :field_map, :query_map
    @@DEFAULT_LOADER = :includes
    cattr_reader :DEFAULT_LOADER

    def initialize(table, query_model, **args)
        @table = table
        @query_model = query_model
        @field_map = query_model.FIELD_MAP
        @query_map = query_model.QUERY_MAP
        @loader = args[:loader] ? args[:loader] : QueryHandler.DEFAULT_LOADER
        @associations = args[:associations] ? args[:associations] : nil
    end

    def collect(params)
        if params[:query]
            query_hash = query_params(params)
        else
            query_hash = {}
        end
        records = call(query_hash)
        return records
    end

    def render(params)
        query_validator = query_model.VALIDATOR
        query_map = query_model.QUERY_MAP
        if params[:query]
            query_hash = query_params(params)
            query_obj = query_model.new(query_hash)
        else
            query_hash = {}
            query_obj = query_model.new
        end
        pagination_range = [table.DEFAULT_PAGINATION , table.MAX_PAGINATION]
        page = params[:page].to_i
        page_limit = params[:view].to_i.between?(*pagination_range) ? params[:view].to_i : pagination_range[0]
        operators = query_map.keys
        validator_map = {:mult_regex => query_validator.MULTIPLE, :error => query_validator.STD_ERRORS}
        records = call(query_hash)
        records = records.limit(page_limit).offset((page)*page_limit).select(table.allowed_columns) 
        last_page = records.count/page_limit
        return records, table.name.downcase, associations, query_obj, field_map, operators, validator_map, page_limit, page, last_page
    end

    def call(query_hash)
        value_format_map = query_model.VALUE_FORMAT_MAP
        records = table
        table_name = table.name.downcase
        query_hash.except(:num_customs).each do |c, v|
            v.each{ |i, q|
                
                qm_hash = query_map[q[:operator].to_sym]
                value_format = value_format_map[qm_hash[:format]]
                f_type = field_map[c.to_sym][:validator]
                symbol = qm_hash[:symbol]
                validate_fn = qm_hash[:validate]
                formatted_column = "#{c}#{query_model.format_field(f_type, qm_hash[:to_text])}"
                value = query_model.public_send(validate_fn, f_type, q[:value] )
                records = records.where("#{table_name}s.#{formatted_column} #{symbol} #{value_format}", value) 
            }
            #https://guides.rubyonrails.org/security.html Use inserted string since AR automatically escapes quotes/apostrophes
        end
        records = records.public_send(loader, associations)
        return records
    end

    private
    def query_params(params)
        permit_map = table.allowed_columns.map{|k| [k.to_sym, (0..query_model.MAX_CUSTOMS.to_i).map{|index| [index, [:operator, :value, :multiple]]}]}.to_h
        qp_hash = params.require(:query).permit(permit_map)
        qp_hash.each{
            |k0, v0| qp_hash[k0] = v0.select{
                |k1, v1| (v1.key?(:value) && v1.key?(:operator)) && 
                ((v1[:value].empty? && v1[:operator].to_sym == :empty) || (!v1[:value].empty? && !v1[:operator].empty?))
            }
        }
        qp_hash = qp_hash.merge(params.permit(:num_customs))
        qp_hash.select{ |k, v| !v.empty?}
    end
end

