#! /bin/sh

# The path to your jsdoc-toolkit folder (no ending slash)
JSTOOLKIT_ROOT='/opt/local/bin/jsdoc-toolkit'



# Get new client side code
echo 'Updating client side code'
git checkout master concertapp/static/js/
# Remove vendor client side code (we dont need to document any)
rm -R concertapp/static/js/lib/vendor/

# Generate the client-side documentation
echo 'Generating client side documentation'
java -jar $JSTOOLKIT_ROOT/jsrun.jar $JSTOOLKIT_ROOT/app/run.js -r -d=./clientside concertapp/static/js/ -t=$JSTOOLKIT_ROOT/templates/jsdoc/

# Commit changes
echo 'Adding clientside documentation to git'
git add clientside/
echo 'Committing'
git commit -a -m 'Documentation update.'

# Push
echo 'Pushing'
git push origin gh-pages
