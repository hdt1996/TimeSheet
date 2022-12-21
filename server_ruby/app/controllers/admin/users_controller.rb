require 'csv'
require 'roo'

module Admin
  class UsersController < ApplicationController
    def index
      limit = 25
      @page = params[:page].to_i
      @users = User.limit(limit).offset((@page)*limit)
    end

    def new
      @users = User.all()
    end

    def create
      if params[:csv]
        notice = "CSV: File Upload in Progress"
        xlsx = Roo::Spreadsheet.open(params[:csv], extension: 'xlsx', headers: true)
        arr_data = xlsx.sheet(0).parse(headers: true)
        arr_data.each do |row|
          user = User.new(row)
          user.save
        end
      else
        notice = "CSV: No File for Upload"
      end
      redirect_to admin_users_path, notice: notice
    end

    def export
      set_csv_stream(User)
      respond_to do |format| format.csv end #Use when streaming, if file already exists ready to serve: use send_file or send_data (binary)
    end
    
  private
    def set_csv_stream(table)
      export_col_names = table.export_column_names
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
end
