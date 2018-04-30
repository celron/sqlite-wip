// JavaScript source code
/* class file to handle pouchdb persistance
 * requires pouchdb() and pouchdb.find()
 *
 * possibly use sqlite in the future
 */
class PersistantHCode {
    constructor(code) {
        this.url = "http://staging.hiamaps.com/getblocks.php";
        this.code = code;//database code.. should it be uppercase?
        this.db = new PouchDB('local');
        this.rowcount = 0;
        this.flag = $.Deferred();
        var retdata = this.rowCount();
        var obj = this;
        retdata.done(function (value) {
        if (value === 0) {
            var retval = query(this.code,this.url);
            retval.done(function (data, status) {
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
                    db.createIndex({
                        index: {
                            fields: ['lat', 'lng'],
                            name: 'location'
                        }
                    }).then(function (result) {
                        console.log('location index ' + result.result);
                        db.createIndex({
                            index: {
                                fields: ['updated_at'],
                                name: 'updated_at'
                            }
                        }).then(function () {
                            obj.flag.resolve(0);
                        })
                    });
                });

            });
        } else {
            console.log('rowcount' + value);
            obj.checkDatabase().then(function () {
                obj.flag.resolve(0);
            });
        }
        })

    }
    checkDatabase() {
        var flag = $.Deferred();
        var ret_data = this.maxDate();
        var obj = this;
        ret_data.done(function (date, status) {

            var retval = obj.query_from_date(obj.code, date,obj.url);
            retval.done(function (rawdata, status) {
                var data = JSON.parse(rawdata);
                if (data.data === null) {
                    console.log('no rows returned for update');
                    flag.resolve(0);
                    return;
                }
                console.log('added rows:' + data.data.length);
                for (var i = 0; i < data.data.length; i++) {
                    data.data[i]._id = data.data[i].id;
                    obj.pouch_addrow(data.data[i]);
                }
                flag.resolve(0);
            });
        });
        return flag;
    }
    get code() {
        return this.hcode;
    }
    set code(code) {
        this.hcode = code;
    }
    get maxdate() {
        return this.maxDate;
    }
    set maxdate(date) {
        this.maxDate = date;
    }
    get url() {
        return this.url_link;
    }
    set url(link) {
        this.url_link = link;
    }
    maxDate() {
        var retval = $.Deferred();
        this.db.find({
            selector: {
                updated_at: { $gt: '' }
            },
            fields: ['updated_at', 'id']
        }).then(function (result) {
            var data = result.docs.reverse();
            retval.resolve(data[0].updated_at);
        });
        return retval;
    }
    get rowcount() {
        return this.count;
    }
    set rowcount(value) {
        this.count = value;
    }
    rowCount() {
        var retval = $.Deferred();
        this.db.info(function (error, result) {
            if (!error) {
                retval.resolve(result.doc_count);
            } else {
                retval.resolve(0);
            }
        });
        return retval;
    }
    query(code,url) {
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

    query_from_date(code, date, url) {
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
    pouch_addrow(data) {
       this.db.put(data);
    }
    selectAll() {
        var retval = $.Deferred();
        var obj = this;
        this.db.allDocs(function (err, result) {
            if (!err) {
                var array = [];
                var counter = result.rows.length;
                for (var i = 0; i < result.rows.length; i++) {
                    obj.db.get(result.rows[i].id, function (err, result) {
                        if (!err) {
                            array.push(result);
                            counter--;
                            if (counter === 0) {
                                retval.resolve(array);
                            }
                        }
                    });
                }
                
            } else {
                retval.resolve(err);
            }
        });
        return retval;
    }
    dropDb() {
        var retval = $.Deferred();
        this.db.destroy(function (err, result) {
            if (!err)
                retval.resolve(0);
            else
                retval.resolve(err);
        });
        return retval;
    }
    readId(id) {
        var retval = $.Deferred();
        this.db.find({
            selector: {
                _id: { $eq: id }
            }
        }).then(function (result) {
            console.log(JSON.stringify(result));
            retval.resolve(result);
            }).then(function (error) {
                console.log('error' + JSON.stringify(result));
                retval.resolve(error);
        });
        return retval;
    }
    findUpdatedAtAfter(date) {
        var retdata = $.Deferred();
        this.db.find({
            selector: {
                updated_at: { $gt: date }
            },
            fields: ['id', '_id', '_rev', 'updated_at']
        }).then(function (result) {
            retdata.resolve(result.docs);
            }).then(function (error) {
                retdata.resolve(error);
        });
        return retdata;
    }
    deleteId(id, rev) {
        var retdata = $.Deferred();
        this.db.remove(id, rev).then(function (results) {
            retdata.resolve(0);
        }).then(function (err) {
            retdata.resolve(err);
        });
        return retdata;
    }
}