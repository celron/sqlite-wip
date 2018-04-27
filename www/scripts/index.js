// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
var db;
(function () {
    "use strict";
    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        output('device ready');
        getClusterData('+WEWORK');
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        //sqliteprocess();
        pouchdbprocess();
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
    var output = function(message){
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

    function handleBlockCode(code) {
        var retval = $.ajax({
            type: 'POST',
            url: 'https://www.hiamaps.com/getblocks.php',
            data: {
                action: 'getdrops',
                inviteCode: code,
                token: '',
                selector: ''
            },
            xhrFields: {
                withCredientials: false
            },
            error: function (xhr, desc, err) {
                output('xhr:' + JSON.stringify(xhr));
                output('Error:'+desc+err);
            }
        });
        return retval;
    }
    function getClusterData(code) {
        output('calling block code');
        var data = handleBlockCode(code);
        data.done(function (info) {
            output('cluster returned');
            wework = JSON.parse(info);
            permanent = info.data;
            output(permanent.length);
            console.log(permament);
        });
    }
    function pouch() {
        db = new PouchDB('local');
        pouchrowcount();
        console.log('open pouch');
    }
    function pouchinit(){    
        $('#init').click(pouch);
        $('#rowcount').click(pouchrowcount);
        $('#insert').click(pouchinsert);
        $('#select').click(pouch_read);
        $('#drop').click(pouch_drop);    
    }
    function pouchrowcount(){
        db.info(function (error, result) {
            if (!error){
                $('#pouch_count').text(result.doc_count+' rows');
            }else{
                output(error)
            }
        });
       
    }
    function pouchinsert(){
        var wework = [
            {
            _id: '1',
            name: 'wework wall street',
            address: '110 Wall Street',
            lat: 10,
            lng: 20
            },
            {
                _id: '2',
                name: 'wework 34th',
                address: '34 Wall Street',
                lat: 10,
                lng: 20
            },
            {
                _id: '3',
                name: 'wework 7th avenue',
                address: '300 7th avenue',
                lat: 10,
                lng: 20
            }
        ]
        for (var i = 0; i < wework.length; i++) {
            db.put(wework[i], function (err, result) {
                if (!err)
                    output('successful write');
                else// 409 conflict, already exists
                    output('write error:'+err.status+':'+err.name);
            });
        }
    }
    function pouch_write(){
    
    }
    function pouch_read() {
        db.allDocs(function (err, result) {

            if (!err){
                for(var i = 0;i< result.rows.length;i++){
                    db.get(result.rows[i].id,function(err,result){
                        if(!err)
                            output(JSON.stringify(result));
                    })                    
                }
                output(result);
            }else
                output(err);
        });
    }
    function index_read(id) {
    
    }
    function pouch_drop(){
        db.destroy(function(err, result){
            if (!err)
                output('database drop');
            else
                output(err);
            
        })
    }
    
    document.addEventListener("DOMContentLoaded", function(event) { 
        //do work
        pouchinit();
      });
} )();
