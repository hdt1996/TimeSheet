class Employee < ApplicationRecord
  belongs_to :user
  has_many :medium, validate: false
  validates :user, presence: true, allow_blank: false, allow_nil: false, uniqueness: true #standard per https://guides.rubyonrails.org/getting_started.html
  validates :email, presence: true, allow_blank: false, uniqueness: true 
  validates :hourly, inclusion: [true, false]
  validates :department, presence: true, length: {maximum: 25}
  validates :pay_rate, presence: true, numericality: true
end
