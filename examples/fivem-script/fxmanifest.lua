fx_version 'bodacious'
game 'gta5'

author 'iGoodie'
version '1.0.0'

fxdk_watch_command 'pnpm' {'watch'}
fxdk_build_command 'pnpm' {'build'}

client_script 'dist/client.js'
server_script 'dist/server.js'
ui_page "dist/ui/index.html"

files {"dist/**/*"}
