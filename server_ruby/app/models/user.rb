class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  attr_writer :login
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, authentication_keys: [:login]
  enum role: [:user, :moderator, :admin]

  #standard validation per https://guides.rubyonrails.org/getting_started.html
  validates :username, presence: true, allow_blank: false, uniqueness: true 
  validates :email, length: { maximum: 50 }
  validates :first_name, presence: true, length: {maximum: 20}
  validates :middle_name, presence: false, length: {maximum: 20}
  validates :last_name, presence: true, length: {maximum: 20}

  after_initialize :set_default_role, :if => :new_record?
  has_one :employee

  def self.excluded_columns
    ['encrypted_password','reset_password_token','reset_password_sent_at','remember_created_at']
  end

  def self.allowed_columns #static User.allowed_columns
    column_names - excluded_columns
  end

  def set_default_role #instance
    self.role ||= :user
  end

  def login
    @login || self.username || self.email
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

