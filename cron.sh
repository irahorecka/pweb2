#!/usr/bin/env bash

crontab -l > mycron
# Setup cron headers
echo "SHELL=/bin/bash" >> mycron
# For executing clean_craigslist_housing
echo "0 6-22/2 * * * root source /home/irahorecka/pweb2/webenv/bin/activate && python /home/irahorecka/pweb2/update_db.py" >> mycron
# For executing rm_expired_craigslist_housing
echo "0 2 * * * root source /home/irahorecka/pweb2/webenv/bin/activate && python /home/irahorecka/pweb2/rm_expired_db.py" >> mycron
crontab mycron
rm mycron