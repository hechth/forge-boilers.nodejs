//////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
//////////////////////////////////////////////////////////////////////////
import 'app.css'

import Basic from './extensions/Viewing.Extension.Basic.js'
import Toolbar from './extensions/Autodesk.ADN.Viewing.Extension.Toolbar/Autodesk.ADN.Viewing.Extension.Toolbar.js'
import Markup2DExtension from './extensions/Viewing.Extension.Markup2D/Viewing.Extension.Markup2D.js'
import ModuleLoader from './extensions/Autodesk.ADN.Viewing.Extension.ModelLoader/Autodesk.ADN.Viewing.Extension.ModelLoader'

import MarkupsCore from './extensions/Viewing.Extension.Markup2D/MarkupsCore.js'

import 'bootstrap'
//import 'bootstrap-compass'
import 'bootstrap-sass'
//import 'bootstrap/dist/css/bootstrap.css'
import 'jquery-ui';
import ViewerToolkit from './ViewerToolkit';

var key = false;
var urn_rac = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTA0LTAyLTA1LTQyLTI3LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3JzdF9hZHZhbmNlZF9hcmNoLnJ2dA'
var urn_rst = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTA0LTAxLTEyLTQyLTI3LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3JzdF9hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5pZmM';
var urn_rme = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTA0LTAyLTA1LTMzLTEwLWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3JzdF9hZHZhbmNlZF9tZXAucnZ0'

var activeModel = 0; // 0 = rac, 1 = rst, 2 = rme

// Predefined data sets
var revisions_rac = [ "01 Mai 2016",
                      "24 April 2016",
                      "12 April 2016",
                      "30 March 2016",
                      "08 March 2016"
                    ];
var rac_sel_set = [[2616], [2400], [9537, 9566, 9594], 
                   [4973,
                    5790,
                    5794,
                    5798,
                    5802,
                    5806,
                    5810,
                    9106,
                    9110,
                    9114,
                    9118], 
                   [3138,
                    3142,
                    3144,
                    3146,
                    3148,
                    3150]
                  ];

var revisions_rst = [ "10 Jan 2016",
                      "11 Feb 2016",
                      "21 Feb 2016",
                      "15 March 2016",
                      "17 March 2016",
                      "25 April 2016",
                      "05 July 2016",
                      "30 Sep 2016"
                    ];
                    
var rst_sel_set = [ 
                    [1301],
                    [1309],
                    [1311, 1453, 1455, 1459],
                    [1461],
                    [1178,1180,1182],
                    [1184,1186,1188,1194,1555,1567,1573],
                    [1579,1585,1591],
                    [2506]
                  ];


var revisions_rme = [ "14 Nov 2015",
                      "02 Jan 2016",
                      "01 April 2016",
                      "05 July 2016"
                    ];
var rme_sel_set = [[4663], [7006], [4671], [5824, 5825, 5827], [5281]];


/////////////////////////////////////////////////////////////////
// Initialization Options
//
/////////////////////////////////////////////////////////////////
var initOptions = {

  env: 'AutodeskProduction',

  getAccessToken: function(onGetAccessToken) {

    $.get('/api/forge/token/2legged', function(tokenResponse) {

      onGetAccessToken(
        tokenResponse.access_token,
        tokenResponse.expires_in)
    })
  }
}

var document_rst_1 = null;
var document_rst_2 = null;
var viewer = null;

function highlightByIds(viewer, idArr) {
  //alert("highlightByIds()");

  viewer.clearSelection();

  idArr.forEach(function(id) {
    console.log("DEBUG: Select " + id);
    viewer.toggleSelect(id);
  });
}

function addMaterial(color) {

  var material = new THREE.MeshPhongMaterial({
    color: color
  });

  viewer.impl.matman().addMaterial(
    guid(),
    material);

  return material;
}
// function isolateFull(dbIds = []) {

//   viewer.isolate(dbIds)

//   const targetIds = Array.isArray(dbIds) ? dbIds : [dbIds]
// }

function loadDocToViewer(urn) {
  console.log("loadDocToViewer");

  Autodesk.Viewing.Document.load(
    urn,
    function(doc) {
      onDocumentLoaded(doc);
    },
    function(errCode) { onLoadError(errCode) }
  );
}

function initializeViewer() {

}
/////////////////////////////////////////////////////////////////
// Document Loaded Handler
//
/////////////////////////////////////////////////////////////////
function onDocumentLoaded(doc) {

  var rootItem = doc.getRootItem()

  // Grab all 3D items
  var geometryItems3d =
    Autodesk.Viewing.Document.getSubItemsWithProperties(
      rootItem, { 'type': 'geometry', 'role': '3d' }, true)

  // Grab all 2D items
  var geometryItems2d =
    Autodesk.Viewing.Document.getSubItemsWithProperties(
      rootItem, { 'type': 'geometry', 'role': '2d' }, true)

  // Pick the first 3D item otherwise first 2D item
  var selectedItem = (geometryItems3d.length ?
    geometryItems3d[0] :
    geometryItems2d[0])

  var domContainer = document.getElementById('viewer')

  // UI-less Version: viewer without controls and commands
  //viewer = new Autodesk.Viewing.Viewer3D(domContainer)

  var child = domContainer.firstChild;
  while (!!child) {
    domContainer.removeChild(child);
    child = domContainer.firstChild;
  }

  // GUI Version: viewer with controls
  viewer = new Autodesk.Viewing.Private.GuiViewer3D(domContainer);
  viewer.initialize();

  // viewer.addEventListener(Autodesk.Viewing.EXPLODE_CHANGE_EVENT, function(ed) {
  //   highlightByIds(viewer, [2126, 2668]);
  // });

  viewer.loadModel(doc.getViewablePath(selectedItem));

  //viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectionChanged);
  // viewer.loadExtension('Viewing.Extension.Basic');
  viewer.loadExtension('Viewing.Extension.Markup2D');
  // viewer.loadExtension('Autodesk.ADN.Viewing.Extension.ModelLoader', options);
  window.selectionMaterial = addMaterial(0xFF0000);
}

function onSelectionChanged(event) {
  console.log(event);
}
/////////////////////////////////////////////////////////////////
// Environment Initialized Handler
//
/////////////////////////////////////////////////////////////////
function onEnvInitialized() {
  loadDocToViewer(urn_rac);
}

/////////////////////////////////////////////////////////////////
// Error Handler
//
/////////////////////////////////////////////////////////////////
function onLoadError(errCode) {

  console.log('Error loading document: ' + errCode)
}

/////////////////////////////////////////////////////////////////
// Error Handler
//
/////////////////////////////////////////////////////////////////
function guid() {

  var d = new Date().getTime();

  var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
    /[xy]/g,
    function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });

  return guid;
}

function setRevisionListContent(list, data)
{
  list.empty();
    $.each(data, function(i) {
      var li = $('<li/>')
        .addClass('todo-list-item')
        .attr('id', "revision_" + i)
        .text(data[i])
        .appendTo(list);
    });
}

//////////////////////////////////////////////////////////////////////////
// Application Bootstrapping
//
//////////////////////////////////////////////////////////////////////////
$(document).ready(function() {

  //$('#revisions-list li').click(function() { 

  var rList = $('#revisions-list')
  setRevisionListContent(rList, revisions_rac);
  activeModel = 0;

  function onRevisionCLicked()
  {
    console.log("Revision " + this.id);

    var data = rac_sel_set;
    if (activeModel === 1)
      data = rst_sel_set;
    else if (activeModel === 2)
      data = rme_sel_set;

    var revisionNbr = Number(this.id.substr(9));    
    //highlightByIds(viewer, data[revisionNbr]);

    viewer.isolate(data[revisionNbr])
    ViewerToolkit.setMaterial(viewer.model, data[revisionNbr], window.selectionMaterial)
    viewer.impl.invalidate(true);

    var cList = $('#element-list')
    cList.empty();
    $.each(data[revisionNbr], function(i) {
      var li = $('<li/>')
        .addClass('todo-list-item')
        .attr('id', data[revisionNbr][i])
        .text('id: ' + data[revisionNbr][i])
        .appendTo(cList);
    });
  };

  $('#revisions-list li').click(onRevisionCLicked);

  $(document).on("click", "#element-list li", function(event) {
    // alert($(this).text()+" clicked");
    // console.log([Number($(this).attr('id'))]);
    // viewer.isolate($(this).attr('id'));
    // highlightByIds(viewer, [($(this).attr('id'))]);
    viewer.fitToView([Number($(this).attr('id'))]);

    $('#element-id-i').empty();
    $('#changed-by-i').empty();
    $('#comment-input-id').empty();
    if (key === false) {

      $('<p>4172</p>').appendTo('#element-id-i');
      $('<p>Helge Hecht</p>').appendTo('#changed-by-i');
      $('<p>Increase thickness to satisfy new load specifications</p>').appendTo('#comment-input-id');
      key = true;
    } else {

      $('<p>2873</p>').appendTo('#element-id-i');
      $('<p>Daniel Zibion</p>').appendTo('#changed-by-i');
      $('<p>Fixed mistake in density property</p>').appendTo('#comment-input-id');
      key = false;
    }
  });


  // Domain/discipline selection buttons
  $('#btnArch').on('change', function () {
    loadDocToViewer(urn_rac);
    setRevisionListContent(rList, revisions_rac);
    $('#revisions-list li').click(onRevisionCLicked);
    activeModel = 0;
    $('#element-id-i').empty();
    $('#changed-by-i').empty();
    $('#comment-input-id').empty();
    $('#element-list').empty();
});
  $('#btnStruct').on('change', function () {
    loadDocToViewer(urn_rst);
    activeModel = 1;
    setRevisionListContent(rList, revisions_rst);
    $('#revisions-list li').click(onRevisionCLicked);
    $('#element-id-i').empty();
    $('#changed-by-i').empty();
    $('#comment-input-id').empty();
    $('#element-list').empty();
});
  $('#btnMep').on('change', function () {
    loadDocToViewer(urn_rme);
    activeModel = 2;
    setRevisionListContent(rList, revisions_rme);
    $('#revisions-list li').click(onRevisionCLicked);
    $('#element-id-i').empty();
    $('#changed-by-i').empty();
    $('#comment-input-id').empty();
    $('#element-list').empty();
});

  Autodesk.Viewing.Initializer(
    initOptions,
    function() {
      onEnvInitialized()
    })


})
