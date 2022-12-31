module QueryHandler
    def processQuery(table, query_model)
        permit_map = table.allowed_columns.map{|k| [k.to_sym, (0..query_model.MAX_CUSTOMS.to_i).map{|index| [index, [:operator, :value, :multiple]]}]}.to_h
        operators = query_model.OPERATORS
        field_map = query_model.FIELD_MAP
        page_limit = [table.MAX_PAGINATION, params[:view].to_i > 0 ? params[:view].to_i : table.DEFAULT_PAGINATION].min
        field_validators = query_model.OPERATOR_VALIDATION
        records = table
        if params[:query]
            query_hash = query_params(permit_map)
            query_obj = query_model.new(query_hash)
            query_hash.except(:num_customs).each do |c, v|
                v.each{ |i, q|
                    records = records.where("#{c} #{operators[q[:operator].to_sym]} ?", q[:value]) 
                }
                #https://guides.rubyonrails.org/security.html Use inserted string since AR automatically escapes quotes/apostrophes
            end
        else
            query_obj = query_model.new()
        end
        
        last_page = records.count/page_limit
        page = params[:page].to_i #, last_page].min
        records = records.limit(page_limit).offset((page)*page_limit).select(table.allowed_columns)
        return records, query_obj, field_map, operators, page_limit, page, last_page, field_validators
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
