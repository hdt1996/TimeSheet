module Admin
  class UsersController < ApplicationController
    before_action :authenticate_admin, except: [:index]
    include CsvHandler
    include QueryHandler

    def authenticate_admin
      if current_user && current_user.admin?
      else
        redirect_to admin_users_path
      end
    end

    def index
      @page = params[:page].to_i
      @users, @user_search, @field_map, @operators, @page_limit, @last_page = processQuery(User, Query::Users)
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
  end
end
