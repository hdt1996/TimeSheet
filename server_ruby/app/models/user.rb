class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, authentication_keys: [:login]
  enum role: [:user, :moderator, :admin]

  #standard validation per https://guides.rubyonrails.org/getting_started.html
  validates :username, presence: true, allow_blank: false, uniqueness: true 
  validates :email, length: { maximum: 50 }
  validates :first_name, presence: true, length: {maximum: 20}
  validates :middle_name, length: {maximum: 20}
  validates :last_name, presence: true, length: {maximum: 20}

  after_initialize :set_default_role, :if => :new_record?
  has_one :employee

  def set_default_role
    self.role ||= :user
  end
  
  def login
    self.username || self.email
  end

  def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    if (login = conditions.delete(:login))
      where(conditions.to_h).where(["lower(username) = :value OR lower(email) = :value", { :value => login.downcase }]).first
    elsif conditions.has_key?(:username) || conditions.has_key?(:email)
      where(conditions.to_h).first
    end
  end

end

