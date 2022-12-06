#Install devise..
# add gem 'devise' to gemfile; it will determine best version for rails -v
rails g devise:install #Make sure to follow instructions post install
rails g devise user #Creates user model via devise
rails g devise:views #Creates views for all devise. Good for seeing html sources and custom modifications
rails generate migration add_field_to_users field:string #adds new field to specified table/model
rails generate migration custom_name #make migration file; any name can be used. Migration file needs to be edited accurately
rails db:migrate #migrate