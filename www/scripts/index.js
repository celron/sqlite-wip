// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
var db;
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
        $('#rowcount').click(rowcount);
        $('#insert').click(insert);
        $('#select').click(select);
        $('#drop').click(drop);
    }
    function rowcount(){
        rowcountTable(db);
    }
    function insert(){
        insertTable(db);
    }
    function select(){
        selectTable(db);
    }
    function drop(){
        dropTable(db);
    }
    function sqliteprocess() {
        console.log('runing sqlite process');
        var echoElement = document.getElementById('echo');
        var selfElement = document.getElementById('self');

        db = window.sqlitePlugin.openDatabase({name: 'test.db', location: 'default',  androidDatabaseImplementation: 2,
            androidLockWorkaround: 1}, function () {
            output('database opened');
            createTable(db);

        }, function (error) {
            navigator.notification.alert("Database opened error", alertCallback, "Error message", "Just a button")
            $('#outputfield').text('database open error');
            console.log('database open error');
        });

        //createTable(db);
    }
    function closeDb(db){
        db.close(function(){
            $('#outputfield').text('database closed');
            console.log('database closed');
        }, function(error){
            console.log('database close error')
        });

    }
    function transaction(db) {
        var retval = $.Deferred();
        db.transaction(function (tr) {
            console.log('begin transaction');
            $('#outputfield').text('begin transaction');
            tr.executeSql("SELECT upper('Test string') AS upperString", [], function (tr, rs) {

                var message = 'Got upperString result: ' + rs.rows.item(0).upperString;
                console.log(message);
                $('#outputfield').text('select executed ' + message);
                navigator.notification.alert(message, alertCallback, "messages", "Just a button")
                retval.resolve(true);
            }, function (error) {
                console.log('error in running sql ' + error.message);

                navigator.notification.alert(error.message, alertCallback, "error", "Just a button")
                $('#outputfield').text('transaction error' + JSON.stringify(error));
                retval.resolve(false);
            });
        }, function (error) {
            console.log('error in sql transaction ' + error);
            retval.resolve(false);
        });
        return retval;
    }
    function dropTable(db){
        var retval = $.Deferred();
        db.transaction(function (tr) {
            tr.executeSql("DROP TABLE wework",[], function(ignored,resultSet){
                    var message = 'table wework dropped';
                    output(message);
                    retval.resolve(true);
                },
                function(error){
                    output('drop table error'+ JSON.stringify(error));
                    retval.resolve(false);
                });

        }, function(error){
            output('drop table transaction error' + JSON.stringify(error));
            retval.resolve(false);
        });
        return retval;
    }
    function rowcountTable(db){
        var retval = $.Deferred();
        db.transaction(function (tr) {
            tr.executeSql("SELECT count(*) AS recordCount FROM wework", [],  function(ignored,resultSet){
                    var message = 'select count table succeed' + resultSet.rows.item(0).recordCount;
                    output(message);
                    retval.resolve(true);
                },
                function(error){
                    var message = 'SELECT SQL ERROR:'+JSON.stringify(error);
                    output(message);
                    retval.resolve(false);
                });

        }, function(error){
            var message = 'SELECT SQL TRANSACTION ERROR:'+JSON.stringify(error);
            output(message);
            retval.resolve(false);
        });
        return retval;
    }
    function selectTable(db){
        var retval = $.Deferred();
        db.transaction(function (tr) {
            tr.executeSql("SELECT * FROM wework", [],  function(ignored,resultSet){
                    var message = 'select count table succeed' + resultSet.rows.length;
                    output(message);
                    for(var i=0;i< resultSet.rows.length;i++){
                        output(JSON.stringify(resultSet.rows.item(i)));
                    }
                    retval.resolve(true);
                },
                function(error){
                    var message = 'SELECT SQL ERROR:'+JSON.stringify(error);
                    output(message);
                    retval.resolve(false);
                });

        }, function(error){
            var message = 'SELECT SQL TRANSACTION ERROR:'+JSON.stringify(error);
            output(message);
            retval.resolve(false);
        });
        return retval;

    }
    function insertTable(db){
        var retval = $.Deferred();
        db.transaction(function (tr) {
            tr.executeSql("INSERT INTO wework (name,address,lat,lng) VALUES(?,?,?,?)",['wework wall','110 wall',10.0,20.0]);
        }, function(error){

            if(error.code === 0) {
                output('insert success code 0');
                retval.resolve(true);
            } else {
                output('Insert Error' + JSON.stringify(error));
                retval.resolve(false);
            }
        }, function() {
            output('Insert success');
            retval.resolve(true);
        });
        return retval;
    }
    function createTable(db) {
        var retval = $.Deferred();
        db.transaction(function (tr) {
            tr.executeSql("CREATE TABLE IF NOT EXISTS wework(id integer primary key, name, address , lat float , lng float)");
            output('table created');
            retval.resolve(true);
        });
        return retval;
    }
    function output(message){
        console.log(message);
        $('#outputfield').append(message);
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
