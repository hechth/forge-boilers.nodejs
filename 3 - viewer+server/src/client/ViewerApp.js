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

var urn = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTA0LTAxLTA5LTQ3LTUzLWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3JzdF9hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5ydnQ'


$(document).ready(() => {

  $("#revisions-list li").click(function() {
    console.log(this.id);
})



/////////////////////////////////////////////////////////////////
// Initialization Options
//
/////////////////////////////////////////////////////////////////
var initOptions = {

  documentId: urn,

  env: 'AutodeskProduction',

  getAccessToken: function(onGetAccessToken) {

    $.get('/api/forge/token/2legged', function(tokenResponse) {

      onGetAccessToken(
        tokenResponse.access_token,
        tokenResponse.expires_in)
    })
  }
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

  // GUI Version: viewer with controls
  var viewer = new Autodesk.Viewing.Private.GuiViewer3D(domContainer)

  viewer.initialize()

  viewer.loadModel(doc.getViewablePath(selectedItem))

  var options = {
    model: {
      name: doc.getViewablePath(selectedItem)
    }
  };

  viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT,onSelectionChanged);
  viewer.loadExtension('Viewing.Extension.Basic')
  viewer.loadExtension('Viewing.Extension.Markup2D')
  viewer.loadExtension('Autodesk.ADN.Viewing.Extension.ModelLoader', options)

}

function onSelectionChanged(event){
  console.log(event);
}
/////////////////////////////////////////////////////////////////
// Environment Initialized Handler
//
/////////////////////////////////////////////////////////////////
function onEnvInitialized() {

  Autodesk.Viewing.Document.load(
    initOptions.documentId,
    function(doc) {
      onDocumentLoaded(doc)
    },
    function(errCode) {
      onLoadError(errCode)
    })
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

  Autodesk.Viewing.Initializer(
    initOptions,
    function() {
      onEnvInitialized()
    })
})
});