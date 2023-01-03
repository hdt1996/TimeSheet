class Admin::UsersController < Admin::Base
    # this controller is necessary because we need completely different implementations of the actions below compared to Devise
    #can also do module Admin with UserController defined in scope
    include CsvHandler
    def query
      request_format = params[:request_format]? params[:request_format] : :html
      request.format = request_format
      respond_to do |format|
        format.html{
         @records, @table_name, @associations, @query_obj, @field_map, @operators, @validators, @page_limit, @page, @last_page = 
         QueryHandler.new(User, Query::Users, :associations => [:employee]).render(params)
        }
        format.csv{
          set_csv_stream(QueryHandler.new(User, Query::Users, :associations => [:employee]).call)
        }
      end
    end

    def edit
      @user = User.find(params[:id])
    end

    def create
      if params[:csv]
        notice = upload_csv(params[:csv])
      else
        notice = "User Creation: No File Uploaded"
      end
      redirect_to admin_users_path, notice: notice
    end

    def destroy
      user = User.find(params[:id])
      begin
        user.destroy
        redirect_to admin_users_path, notice: "User (#{user.id} - #{user.username}) was successfully deleted."
      rescue ActiveRecord::InvalidForeignKey => error
        redirect_to edit_admin_user_path, alert: error.message
      end
    end

    def export
      respond_to do |format| 
        format.csv {set_csv_stream(User)}
      end #Use when streaming, if file already exists ready to serve: use send_file or send_data (binary)
    end
  end

