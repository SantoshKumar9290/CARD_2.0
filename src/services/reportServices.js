const fs = require('fs');
const puppeteer = require('puppeteer');
var sizeOf = require('image-size');
const hbs = require('handlebars');
const oracleDb = require('oracledb');
oracleDb.autoCommit = true;
const Path = require('path');
const PDFPageCounter = require('pdf-page-counter');
const PDFMerger = require('pdf-merger-js');
var QRCode = require('qrcode')
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const { createCanvas, loadImage } = require('canvas');

// const { executeQuery } = require('../plugins/database/oracleDbServcie');
