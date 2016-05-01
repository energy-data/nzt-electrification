#!/bin/ruby
#\ --pid server.pid --quiet --port 9015

require 'json'

ENV['RACK_ENV'] ||= "development"

$static_html = ['/index.html']

$html = { 'Content-Type' => 'text/html', 'Cache-Control' => 'public, no_store' }
$json = { 'Content-Type' => 'application/json' }
$file = { 'Content-Type' => 'application/octet-stream' }

use Rack::Static,
    :urls => ["/node_modules", "/javascripts", "/images", "/stylesheets", "/fonts", "/favicon.ico", *$static_html],
    :root => "./dist"

run lambda { |env|
  req = Rack::Request.new(env)

  if req.path == '/'
    [ 200, $html, File.open('./dist/index.html', File::RDONLY) ]

  # Serve all the .html files with their filename without extension
  #
  elsif req.get? and $static_html.map { |x| x.gsub(".html", '') }.include? req.path
    [ 200, $html, File.open("./dist/#{ req.path }.html", File::RDONLY) ]

  # Receive post and return a json
  #
  # elsif req.post? and req.path == '/copy'
  #   File.open('/tmp/it.svg', 'w') { |f| f.write req.body.read.to_s }
  #   system "convert -density 200 /tmp/it.svg /tmp/it.png"
  #   [ 200, $json, [{ message: 'file_created' }.to_json] ]

  # A send a file
  #
  # elsif req.get? and req.path == '/file'
  #   [ 200, $file.merge({ 'Content-Disposition' => "inline; filename=shot.jpg" }),
  #     File.open('/tmp/shot.jpg', File::RDONLY) ]

  else
    [ 404, $html, ["... nothing here."] ]

  end
}
