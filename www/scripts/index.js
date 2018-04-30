// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
var db;
(function () {
    "use strict";
    document.addEventListener('deviceready', onDeviceReady.bind(this), false);
    var code='+WEWORK';
    var url = "http://staging.hiamaps.com/getblocks.php";
    var value;
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
    var output = function (message, flag) {
        if(!flag)
            console.log(message);
        $('#outputfield').append("<p>"+message+"</p>");
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
            url: 'https://staging.hiamaps.com/getblocks.php',
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
        /*
        db = new PouchDB('local');
        var results = pouchrowcount();
        results.done(function (data) {
            if (data === 0)
                output('0 results');
            else
                output('there are '+data+' rows')
        })

        console.log('open pouch');
        */
        window.data = new PersistantHCode('+WEWORK');

    }
    function pouchinit(){    
        $('#init').click(pouch);
        $('#rowcount').click(pouchrowcount);
        //$('#insert').click(pouchinsert);
        $('#select').click(pouch_read);
        $('#delete').click(pouch_delete);
        $('#drop').click(pouch_drop);    
        $('#test').click(test_pouch);
        value = new PersistantHCode('+WEWORK');
        value.flag.then(function (data) {
            console.log('database loaded');
        });
    }
    function pouch_delete() {
        var cutoff = "2017-05-18 00:12:04";
        if (value) {
            value.findUpdatedAtAfter(cutoff).then(function (data) {
                var counter = data.length;
                for (var i = 0; i < data.length; i++) {
                    value.deleteId(data[i]._id, data[i]._rev).then(function (result) {
                        counter--;
                        if (counter === 0) {
                            console.log('delete done');
                        }
                    })
                }
            });
        }
    }
    function test_pouch() {
        // delete entryes after
        // then try to resync
        var retval = pouch_delete();
        retval.done(function () {
            var max_date = pouch_query_max_date();
            max_date.done(function (data) {
                console.log('query from date' + data);
                var retval2 = query_from_date('+WEWORK', data)
                retval2.done(function (rawdata) {
                    var data = JSON.parse(rawdata);
                    console.log('rows' + data.data.length);
                    for (var i = 0; i < data.data.length; i++) {
                        data.data[i]._id = data.data[i].id;
                        pouch_addrow(data.data[i]);
                    }
                })
            });
        });

    }
    function check_pouchcontents(rowcount) {
        if (rowcount === 0) {
            // if it's empty, add the data'
            query('+WEWORK').then(function (data, status) {
                var return_data = JSON.parse(data);
                for (var i = 0; i < return_data.data.length; i++) {
                    return_data.data[i]._id = return_data.data[i].id;
                    pouch_addrow(return_data.data[i]);
                }
                db.createIndex({
                    index: {
                        fields: ['name'],
                        name: 'name'
                    }
                }).then(function (result) {
                    console.log('name index ' + result.result);
                });
                db.createIndex({
                    index: {
                        fields: ['lat', 'lng'],
                        name: 'location'
                    }
                }).then(function (result) {
                    console.log('location index ' + result.result);
                }); 
                db.createIndex({
                    index: {
                        fields: ['updated_at'],
                        name: 'updated_at'
                    }
                }).then(function (result) {
                    console.log('updated_at index ' + result.result);
                    data = pouch_query_max_date();
                    data.done(function (data, status) {
                        output('max date:' + data);
                    })
                    /*
                    db.find({
                        selector: {
                            updated_at: { $gt: '' }
                        },
                        fields: [ 'updated_at']
                    }).then(function (result) {
                        var data = result.docs.reverse();
                        output(data[0]);
                        db.max_date = data[0].updated_at;
                        console.log(new Date(db.max_date

                        ));
                    });
                */
                });
            });
        }
    }
    function update_pouchcontents() {

    }
    function pouchrowcount() {
        var retval = $.Deferred();
        db.info(function (error, result) {
            if (!error){
                $('#pouch_count').text(result.doc_count + ' rows');
                check_pouchcontents(result.doc_count);
                retval.resolve(result.doc_count);
            }else{
                output(error)
                retval.resolve(0);
            }
        });
        return retval;
       
    }
    function pouch_addrow(data) {
        db.put(data);
    }

    function pouch_read() {
        if (value)
            value.selectAll().then(function (data) {
                output('number of rows read ' + data.length);
                window.array = data;
            });
        /*
        db.allDocs(function (err, result) {

            if (!err) {
                window.array = result.rows;
                for(var i = 0;i< result.rows.length;i++){
                    db.get(result.rows[i].id,function(err,result){
                        if (!err) {
                            output(JSON.stringify(result), 1);
                        }
                    })                    
                }
                output(result);
            }else
                output(err);
        });*/
    }

    function pouch_query_date(date) {
        var retval = $.Deferred();
        db.find({
            selector: {
                updated_at: { $eq: date }
            },
            fields: ['updated_at', 'id']
        }).then(function (result) {
            retval.resolve(result.docs);
        });
        return retval;

    }
    function pouch_query_max_date(){
        var retval = $.Deferred();
        db.find({
            selector: {
                updated_at: { $gt: '' }
            },
            fields: ['updated_at','id']
        }).then(function (result) {
            var data = result.docs.reverse();
            retval.resolve(data[0].updated_at);
            });
        return retval;
    }
    function pouch_drop(){
        db.destroy(function(err, result){
            if (!err)
                output('database drop');
            else
                output(err);
            
        })
    }
    function query_from_date(code,date){
        var retval = $.ajax({
            type: 'POST',
            url: url,
            data: {
                action: 'getdropsfrom',
                inviteCode: code,
                fromDate: date,
                token: '',
                selector: ''
            },
            xhrFields: {
                withCredientials: false
            },
            error: function (xhr, desc, err) {
                alert('Unable to find invite:' + desc);
                console.log('error retrieving invite information' + xhr);
                console.log('Details: ' + desc + '\nError:"+err');
            }
        });
        return retval;
    
    }
    function query_last_date(code){
        var retval = $.ajax({
            type: 'POST',
            url: url,
            data: {
                action: 'getmaxtime',
                inviteCode: code,
                token: '',
                selector: ''
            },
            xhrFields: {
                withCredientials: false
            },
            error: function (xhr, desc, err) {
                alert('Unable to find invite:' + desc);
                console.log('error retrieving invite information' + xhr);
                console.log('Details: ' + desc + '\nError:"+err');
            }
        });
        return retval;
    
    }
    function query(code){
            var retval = $.ajax({
                type: 'POST',
                url: url,
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
                    alert('Unable to find invite:' + desc);
                    console.log('error retrieving invite information' + xhr);
                    console.log('Details: ' + desc + '\nError:"+err');
                }
            });
            return retval;
    }
    document.addEventListener("DOMContentLoaded", function(event) { 
        //do work
        pouchinit();
      });
} )();
function array_compare(a, b) {
    if (a.length > b.length)
        for (var i = 0; i < a.length; i++) {
            var flag = false;
            for (var j = 0; j < b.length; j++) {
                if (a[i].id === b[j].id)
                    flag = true;
            }
            if (flag === false)
                console.log(a[i].id + ' was not found');
        }
    else array_compare(b, a);
}
function index_read(id) {
    var data = "2017-05-18 00:12:04"
    db.find({
        selector: {
            _id: { $eq: id }
        }
    }).then(function (result) {
        console.log
            (JSON.stringify(result));
    })
}