
module QueryHandler
    def processQuery(table, query_model, ** args)
        query_map = query_model.QUERY_MAP
        field_map = query_model.FIELD_MAP
        query_validator = query_model.VALIDATOR
        value_format_map = query_model.VALUE_FORMAT_MAP
        num_to_text_map = query_model.NUM_TO_TEXT_MAP
        operators = query_map.keys

        validator_map = {:mult_regex => query_validator.MULTIPLE, :error => query_validator.STD_ERRORS}
        permit_map = table.allowed_columns.map{|k| [k.to_sym, (0..query_model.MAX_CUSTOMS.to_i).map{|index| [index, [:operator, :value, :multiple]]}]}.to_h
        page_limit = [table.MAX_PAGINATION, params[:view].to_i > 0 ? params[:view].to_i : table.DEFAULT_PAGINATION].min
        page = params[:page].to_i

        loader = args[:query_loader] ? args[:query_loader] : :preload
        associations = args[:associations] ? args[:associations] : nil
        
        records = table
        table_name = :"#{table.name.downcase}"
        if params[:query]
            query_hash = query_params(permit_map)
            query_obj = query_model.new(query_hash)
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
        else
            query_obj = query_model.new
        end
        
        last_page = records.count/page_limit
        records = records.public_send(loader, associations)

        if !args[:all]
            records = records.limit(page_limit).offset((page)*page_limit).select(table.allowed_columns) 
        end

        return records, table_name, associations, query_obj, field_map, operators, validator_map, page_limit, page, last_page
    end

    private
    def query_params(permit_map)
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
