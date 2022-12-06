class Employee < ApplicationRecord
  belongs_to :user
  has_many :medium
  validates :user, presence: true, allow_blank: false, allow_nil: false, uniqueness: true #standard per https://guides.rubyonrails.org/getting_started.html
  validates :email, presence: true, allow_blank: false, uniqueness: true 
  validates :hourly, inclusion: [true, false]
  validates :department, presence: true, length: {maximum: 25}
  validates :pay_rate, presence: false, numericality: true
  validates :photo, presence: false #,  length: {maximum: 1.megabytes}
  validates :onboard_docs, presence: false, length: {maximum: 200.megabytes}
  validate :validate_photo

  def validate_photo
    if photo
      if photo.size > 50.megabytes
        puts "WRONG SIZE" 
      else
        self.photo = Base64.encode64(photo.read) #Necessary because sending binary over the network may send unprintable characters
      end
    end

  end
end
