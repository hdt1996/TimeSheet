# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_12_11_004740) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "employees", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "email", default: "", null: false
    t.boolean "hourly", default: true, null: false
    t.string "department", default: "", null: false
    t.decimal "pay_rate", precision: 20, scale: 2, null: false
    t.binary "photo"
    t.binary "onboard_docs"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_employees_on_user_id"
  end

  create_table "media", force: :cascade do |t|
    t.bigint "employee_id"
    t.string "file_name", limit: 40, null: false
    t.string "file_type", limit: 20, null: false
    t.decimal "file_size", precision: 20, scale: 2, null: false
    t.string "category", limit: 50, default: "", null: false
    t.binary "file_data"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "is_public", default: true
    t.index ["employee_id"], name: "index_media_on_employee_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", limit: 50, default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "username", limit: 30
    t.integer "role", default: 0
    t.string "first_name", limit: 20
    t.string "last_name", limit: 20
    t.string "middle_name", limit: 20
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "employees", "users"
  add_foreign_key "media", "employees"
end
