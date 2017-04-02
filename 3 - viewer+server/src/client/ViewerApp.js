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

var key = false;
var urn_rst1 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTA0LTAyLTA1LTQyLTI3LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3JzdF9hZHZhbmNlZF9hcmNoLnJ2dA'
var urn_rst2 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTA0LTAxLTEyLTQyLTI3LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3JzdF9hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5pZmM';
var urn_rme1 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTA0LTAyLTA1LTMzLTEwLWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3JzdF9hZHZhbmNlZF9tZXAucnZ0'

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

  viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectionChanged);
  // viewer.loadExtension('Viewing.Extension.Basic');
  viewer.loadExtension('Viewing.Extension.Markup2D');
  // viewer.loadExtension('Autodesk.ADN.Viewing.Extension.ModelLoader', options);
}

function onSelectionChanged(event) {
  console.log(event);
}
/////////////////////////////////////////////////////////////////
// Environment Initialized Handler
//
/////////////////////////////////////////////////////////////////
function onEnvInitialized() {
  loadDocToViewer(urn_rst1);
}

/////////////////////////////////////////////////////////////////
// Error Handler
//
/////////////////////////////////////////////////////////////////
function onLoadError(errCode) {

  console.log('Error loading document: ' + errCode)
}

//////////////////////////////////////////////////////////////////////////
// Application Bootstrapping
//
//////////////////////////////////////////////////////////////////////////
$(document).ready(function() {
  
  // $('.btn').button();
  // $('#btnArch').button('toggle')

  $('#revisions-list li').click(function() {

    // empty element list

    var data = []
    if (this.id === 'revision_5') {
      data = [1301];
      highlightByIds(viewer, data);
    } else if (this.id === 'revision_4') {
      data = [1309]
      highlightByIds(viewer, data);
    } else if (this.id === 'revision_3') {
      data = [1311, 1453, 1455, 1459, 1461];
      highlightByIds(viewer, data);
    } else if (this.id === 'revision_2') {
      data = [1178, 1180, 1182, 1184, 1186, 1188, 1194, 1555, 1567, 1573, 1579, 1585, 1591];
      highlightByIds(viewer, data);
    } else if (this.id === 'revision_1') {
      data = [2506];
      highlightByIds(viewer, data);
    }

    var cList = $('#element-list')
    cList.empty();
    $.each(data, function(i) {
      var li = $('<li/>')
        .addClass('todo-list-item')
        .attr('id', data[i])
        .text('id: ' + data[i])
        .appendTo(cList);
    });
  });

  $(document).on("click", "#element-list li", function(event) {
    // alert($(this).text()+" clicked");
    // console.log($(this).attr('id'));
    viewer.fitToView($(this).attr('id'));

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
    loadDocToViewer(urn_rst1);
    $('#element-id-i').empty();
    $('#changed-by-i').empty();
    $('#comment-input-id').empty();
    $('#element-list').empty();
});
  $('#btnStruct').on('change', function () {
    loadDocToViewer(urn_rst2);
    $('#element-id-i').empty();
    $('#changed-by-i').empty();
    $('#comment-input-id').empty();
    $('#element-list').empty();
});
  $('#btnMep').on('change', function () {
    loadDocToViewer(urn_rme1);
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
