class Admin::Base < ApplicationController
    before_action :authenticate_admin

    def authenticate_admin
        if current_user && current_user.admin?
        else
          redirect_to new_user_session_path,  notice: 'Please sign in to authorized account for access to Admin Portal'
        end
      end
end