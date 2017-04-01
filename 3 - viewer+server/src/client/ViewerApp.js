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

var urn_rst1 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTA0LTAxLTEyLTQyLTI3LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3JzdF9hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5pZmM';
var urn_rst2 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTA0LTAxLTEyLTQxLTA4LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3JzdF9hZHZhbmNlZF9zYW1wbGVfcHJvamVjdF9tb2QxLmlmYw'
var urn_rme1 = 'urn:eyJhbGciOiJIUzI1NiIsImtpZCI6Imp3dF9zeW1tZXRyaWNfa2V5In0.eyJjbGllbnRfaWQiOiJ6bEkwaE9JSUNiMFphTzdNV2xYaFRVSmF0cG1jUlk5RiIsImV4cCI6MTQ5MTE2Mjg3OSwic2NvcGUiOlsiZGF0YTpyZWFkIiwiZGF0YTp3cml0ZSIsImRhdGE6Y3JlYXRlIiwiYnVja2V0OmNyZWF0ZSIsImJ1Y2tldDpyZWFkIl0sImF1ZCI6Imh0dHBzOi8vYXV0b2Rlc2suY29tL2F1ZC9qd3RleHAxNDQwIiwianRpIjoiTHd3Tm95YmUwOVE2UjhVcVVmejBSY2RPa0plWnVaSWhjdE55SWdJVVBuN1hQTDBFTUZOUGdWSG5OMmFhNG1QNCJ9.oX5X2Am4Jneet3aUPS-aKBkSwyPOuMR_IpmW6SjTuME'

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

function highlightByIds(viewer, idArr)
{
  viewer.clearSelection();
  
  idArr.forEach(function(id) {
    console.log("DEBUG: Select " + id);
    viewer.toggleSelect(id);
  });
}

function loadDocToViewer(urn)
{
  console.log("loadDocToViewer");

  Autodesk.Viewing.Document.load(
    urn,
    function(doc) {
      onDocumentLoaded(doc);
    },
    function (errCode){ onLoadError (errCode) }
  );  
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
  while (!!child)
  {
    domContainer.removeChild(child);
    child = domContainer.firstChild;
  }

  // GUI Version: viewer with controls
  viewer = new Autodesk.Viewing.Private.GuiViewer3D(domContainer);
  viewer.initialize();

  // viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function(ed) {
  //   console.log(ed);
  // });

  // viewer.addEventListener(Autodesk.Viewing.EXPLODE_CHANGE_EVENT, function(ed) {
  //   highlightByIds(viewer, [2126, 2668]);
  // });

  viewer.loadModel(doc.getViewablePath(selectedItem));

  viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT,onSelectionChanged);
  viewer.loadExtension('Viewing.Extension.Basic');
  viewer.loadExtension('Viewing.Extension.Markup2D');
  viewer.loadExtension('Autodesk.ADN.Viewing.Extension.ModelLoader', options);
}

function onSelectionChanged(event){
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

  $("#revisions-list li").click(function() {
 
 if (this.id === 'revision_5')
 {
    var urn = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTA0LTAxLTA5LTQ3LTUzLWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3JzdF9hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5ydnQ'
 } else if (this.id ==='revision_4') {

    
  document.getElementById("btnArch").addEventListener("click", function(){loadDocToViewer(urn_rst1)}, false);
  document.getElementById("btnStruct").addEventListener("click", function(){loadDocToViewer(urn_rst2)}, false);
  document.getElementById("btnMep").addEventListener("click", function(){loadDocToViewer(urn_rme1)}, false);

  Autodesk.Viewing.Initializer(
    initOptions,
    function() {
      onEnvInitialized()
    })

 }

})

  
})
