module CsvHandler
    def upload_xlsx(temp_xlsx)
        xlsx = Roo::Spreadsheet.open(temp_xlsx, extension: 'xlsx', headers: true)
        arr_data = xlsx.sheet(0).parse(headers: true)
        arr_data.each do |row|
            puts row
            user = User.new(row)
            user.save
        end
        "User Creation: XLSX Upload Complete"
    end

    def upload_csv(temp_csv)
        csv = Roo::Spreadsheet.open(temp_csv, { csv_options: { encoding: 'bom|utf-8' } })
        arr_data = csv.sheet(0).parse(headers: true)
        arr_data.each do |row|
            puts row
            user = User.new(row)
            user.save
        end
        "User Creation: CSV Upload Complete"
    end

    def set_csv_stream(table) #can supply model or query result from model
        export_col_names = table.allowed_columns
        headers.delete("Content-Length")
        headers["Cache-Control"] = "no-cache"
        headers['Content-Type'] = 'text/csv'
        headers['X-Accel-Buffering'] = 'no'
        headers['Content-Disposition'] = "attachment; filename=\"#{table.table_name}_report.csv\"" 
        self.response_body = Enumerator.new do |csv|
            csv << export_col_names.to_csv
            table.find_each(batch_size: 500) do |row|
            csv << export_col_names.map{|col| row.attributes[col]}.to_csv
            end
        end
    end
end
