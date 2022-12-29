module Admin
  class UsersController < ApplicationController
    before_action :authenticate_admin, except: [:index]
    include CsvHandler

    def authenticate_admin
      if current_user && current_user.admin?
      else
        redirect_to admin_users_path
      end
    end

    def index
      limit = 25
      total_users = User.all.count
      @last_page = total_users/limit
      @columns = User.allowed_columns
      @operators = 
      {
        "equal": '=',
        "not equal": '!=',
        "greater": '>', 
        "less": '<',
        "greater or equal": '>=', 
        "less or equal": '<=', 
        "in": ':', 
        "starts with": '^', 
        "ends with": '$', 
        "contains": 'ctn'
      }
      @page = params[:page].to_i
      
      if params[:user_search]
        @users = User
        search_params = query_params
        @user_search = UserSearch.new(search_params)
        search_oper = search_params[:operator]
        search_params.except(:operator).each do |k, v|
          @users = @users.where("#{k} #{@operators[search_oper.to_sym]} ?", v) #https://guides.rubyonrails.org/security.html Use inserted string since AR automatically escapes quotes/apostrophes
        end
        @users = @users.limit(limit).offset((@page)*limit).select(User.allowed_columns)
      else
        @user_search = UserSearch.new
        @users = User.limit(limit).offset((@page)*limit).select(User.allowed_columns)
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
      set_csv_stream(User)
      respond_to do |format| format.csv end #Use when streaming, if file already exists ready to serve: use send_file or send_data (binary)
    end

    private
    def query_params
      qp_hash = params.require(:user_search).permit(:operator, :staff, User.allowed_columns)
      qp_hash.select{|k, v| !v.empty?}
    end
  end
end
