echo '---------------------------------'
echo 'Running test ' $1'-test.js'
echo '---------------------------------'
find src/lib -depth -name '*-test.js' ! -name $1'-test.js' -execdir bash -c 'mv "$0" "${0//-test.js/-test.js.bak}"' {} \;
find src/lib -depth -name '*-test.html' ! -name $1'-test.html' -execdir bash -c 'mv "$0" "${0//-test.html/-test.html.bak}"' {} \;
npm run test;
find src/lib -depth -name '*-test.js.bak' -execdir bash -c 'mv "$0" "${0//-test.js.bak/-test.js}"' {} \;
find src/lib -depth -name '*-test.html.bak' -execdir bash -c 'mv "$0" "${0//-test.html.bak/-test.html}"' {} \;
