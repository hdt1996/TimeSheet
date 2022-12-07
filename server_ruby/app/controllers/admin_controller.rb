class AdminController < ApplicationController
  def ssr_index
    @users = User.all()
  end
end
