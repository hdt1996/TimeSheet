const { environment } = require('@rails/webpacker')

// ADD JQUERY per #https://botreetechnologies.medium.com/rails-6-jquery-using-webpacker-a3611b297c35
const webpack = require('webpack')
environment.plugins.prepend('Provide', new webpack.ProvidePlugin({
    $: 'jquery/src/jquery',
    jQuery: 'jquery/src/jquery'
}))

module.exports = environment