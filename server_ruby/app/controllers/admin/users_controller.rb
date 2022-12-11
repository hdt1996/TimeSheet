require 'csv'
require 'roo'

module Admin
  class UsersController < ApplicationController
    def index
      limit = 50
      @page = params[:page].to_i || 1
      @users = User.limit(limit).offset(@page*limit)
    end

    def new
      @users = User.all()
    end

    def create
      xlsx = Roo::Spreadsheet.open(params[:csv], extension: 'xlsx', headers: true)
      arr_data = xlsx.sheet(0).parse(headers: true)
      arr_data.each do |row|
        user = User.new(row)
        user.save
      end
      #User.upsert_all(arr_data)
    end

  private

  end
end
