Rails.application.routes.draw do
  devise_for :users, :controllers => { registrations: 'users/registrations' }

  get 'employees/index'
  resources :employees, except: 'index'
  get "employees/*path", to: 'employees#index', via: :get

  get 'media/download'

  namespace :admin do
    resource :users, only: 'export' do
      get 'export', to: 'users#export'
    end
    resources :users 
  end


  get '/admin/users*path', to: 'admin/users#index'
  
  #scope :admin do
  #  resources :users, module: 'admin', path: '/users'
  #end

  get "*path", to: 'root#index', via: :get
  root 'root#index'

  resources 'media'

  # resources __path__ means assign all CRUD routes/actions without having to map each one (get... post.. etc.)
  resources :users do
    resources :employees
  end

  resources :employees do
    resources :media
  end
end
