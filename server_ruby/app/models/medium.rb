class Medium < ApplicationRecord
    attr_accessor :file
    belongs_to :employee
    before_validation :initialize_file
    validates :employee, presence: false, allow_blank: false, allow_nil: false, uniqueness: true #standard per https://guides.rubyonrails.org/getting_started.html
    validates :file_name, presence: false, length: {maximum: 40}
    validates :file_type, presence: true, length: {maximum: 20}
    validates :file_size, presence: true, numericality: true
    validates :file_data, presence: true, allow_blank: false, allow_nil: false
    validates :category, presence: false, length: {maximum: 50}
    validates :is_public, inclusion: [true, false]

    def initialize_file        
        self.file_name = file.original_filename
        self.file_type = file.content_type
        self.file_size = file.size
        self.file_data = Base64.encode64(file.read) #Necessary because sending binary over the network may send unprintable characters
    end
end
