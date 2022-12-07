class MediaController < ApplicationController
  def download
    file = Medium.find(params[:file_id])
    send_data Base64.decode64(file.file_data), type: file.file_type, filename: file.file_name
  end
end
