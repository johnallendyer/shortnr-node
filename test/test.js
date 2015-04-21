/* jslint node: true */
/* global describe: false, before: false, after: false, it: false */
'use strict';

var expect = require('chai').expect,
    request = require('request'),
    server = require('../app'),
    redis = require('redis'),
    client = redis.createClient();

describe('server', function() {
    // Before tests, start the server
    before(function(done) {
        console.log('Starting the server');
        done();
    });

    // After tests, stop the server and empty the database
    after(function(done) {
        console.log('Stopping the server');
        client.flushdb();
        done();
    });

    // Test the index route
    describe('Test the index route', function() {
        it('should return a page with the title Shortnr', function(done) {
            request.get({ url: 'http://localhost:3000' }, function(error, response, body) {
                expect(body).to.include('Shortnr');
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal('text/html; charset=utf-8');
                done();
            });
        });
    });

    // Test submitting a URL
    describe('Test submitting a URL', function() {
        it('should return the shortened URL', function(done) {
            request.post('http://localhost:3000', { form: { url: 'http://www.google.com' }}, function(error, response, body) {
                expect(body).to.include('Your shortened URL is');
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal('text/html; charset=utf-8');
                done();
            });
        });
    });

    // Test submitting an invalid URL
    describe('Test submitting an invalid URL', function() {
        it('should return a 404', function(done) {
            request.post('http://localhost:3000', { form: { url: '@n-invalid,url' }}, function(error, response, body) {
                expect(response.statusCode).to.equal(404);
                expect(body).to.include('Link not found');
                done();
            });
        });
    });

    // Test following a shortened URL
    describe('Test following a shortened URL', function() {
        it('should redirect the user to the shortened URL', function(done) {
            client.set('testurl', 'http://www.google.com', function() {
                request.get({
                    url: 'http://localhost:3000/testurl',
                    followRedirect: false
                }, function(error, response, body) {
                    expect(response.headers.location).to.equal('http://www.google.com');
                    expect(response.statusCode).to.equal(301);
                    done();
                });
            });
        });
    });

    // Test non-existent link
    describe('Test following a non-existent link', function() {
        it('should return a 404', function(done) {
            request.get({
                url: 'http://localhost:3000/nonexistenturl',
                followRedirect: false
            }, function(error, response, body) {
                expect(response.statusCode).to.equal(404);
                expect(body).to.include('Link not found');
                done();
            });
        });
    });
});
