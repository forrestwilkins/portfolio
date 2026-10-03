# Aliases - For Awesomely Maximized Laziness

# System
alias sudo='sudo '
alias lsa='ls -a'
alias cls='clear'
alias cd..='cd ..'
alias space='df -h /'
alias size='du -sh'
alias aliases='micro ~/.aliases'
alias cat_aliases='cat ~/.aliases'
alias fresh='source ~/.zshrc'
alias zshrc='micro ~/.zshrc'

# Nginx
alias nginx_conf='sudo micro /etc/nginx/nginx.conf'
alias check_nginx='nginx -c /etc/nginx/nginx.conf -t'
alias praxis_nginx_conf='sudo micro /etc/nginx/sites-available/praxis-app.org'

# Git
alias pull='git pull'
alias push='git push'
alias clone='git clone'
alias checkout='git checkout'
alias main='checkout main && pull'
alias restore='git restore --staged'
alias status='git status'

# Docker
alias rm_volumes='sudo docker volume rm $(sudo docker volume ls -qf dangling=true | xargs)'
alias prune_system='sudo docker system prune -af'
alias docker_build='sudo docker compose up -d --build'
alias docker_cleanup='prune_system && rm_volumes'

# Projects
alias cdshop='cd ~/praxis-chat'
alias cdrhizome='cd ~/rhizome'
alias yeet='cd ~/portfolio && pull && docker_build'
alias rhizome='cdrhizome && pull && docker_build && docker_cleanup'
