// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        console.log('device ready');
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        sqliteprocess();

    }
    function sqliteprocess() {
        console.log('runing sqlite process');
        var echoElement = document.getElementById('echo');
        var selfElement = document.getElementById('self');
 //       echoElement.setAttribute('style', 'display:none');
 //       selfElement.setAttribute('style', 'display:none');
        window.sqlitePlugin.echoTest(function () {
            echoElement.setAttribute('style', 'display:block');
            console.log('ECHO test OK');
        });
        window.sqlitePlugin.selfTest(function () {
            selfElement.setAttribute('style', 'display:block');
            console.log('SELF test OK');
        });
        var db = window.sqlitePlugin.openDatabase({ name: 'test.db', location: 'default' });
        //navigator.notification.alert("Database opened", alertCallback, "A title", "Just a button")
        $('#outputfield').text('database opened');
        console.log('database opened');

        db.transaction(function (tr) {
            tr.executeSql("SELECT upper('Test string') AS upperString", [], function (tr, rs) {

                message = 'Got upperString result: ' + rs.rows.item(0).upperString;
                console.log(message);
                $('#outputfield').text(message);
                navigator.notification.alert(message, alertCallback, "A title", "Just a button")
            });
        });
    }
    function alertCallback() {
        console.log('alert callback')
    }
    function onPause() {
        // TODO: This application has been suspended. Save application state here.
        console.log('on pause');
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
        console.log('on resume');
    }
} )();