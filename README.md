test for adding sqlite to a windows and android cordova app

Notes:

using Visual Studio to install android sdk will place it in a different location from running android at the command prompt
VSINSTALLDIR- should be set to =C:\Program Files (x86)\Microsoft Visual Studio\2017\Community
PATH should include android platform-tools and tools where it is installed
ANYPC architecture isn't supported by sqlite, so --arch=x64 has to be used

