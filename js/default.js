"use strict";

let jsonAlbums, jsonPlaylist;;
let albumsListe, i_album,last_movement;//next or previous;
let jsonAlbumsLoaded,jsonPlaylistsLoaded = false; 
let newPlaylist = document.querySelector("#newPlaylist"); //Button
let albums = document.querySelector("#albums"); //Button
let eins = document.querySelector("#eins"); //Album Container eins
let zwei = document.querySelector("#zwei"); //Album Container zwei
let drei = document.querySelector("#drei"); //Album Container drei
let vier = document.querySelector("#vier"); //Album Container vier
let id_albums_container = ["#eins","#zwei","#drei","#vier"];
let albumsContainer  = document.querySelector("#albumsContainer");
let playlistContainer = document.querySelector("#playlistContainer > div"); 
let songsContainer = document.querySelector("#songsContainer div"); 
let noteContainer = document.querySelector("#note"); 
let today = document.querySelector("#today");
let meinPlaylists, activePlaylist;

function init(){
    let todayDate = new Date()
    //Containers
    today.textContent  = `${todayDate.getDate()}.${todayDate.getMonth() + 1}.${todayDate.getFullYear()}`;
    $(albumsContainer).hide();
    $(playlistContainer).hide();
    $(songsContainer).hide();
    //Buttons
    newPlaylist.addEventListener("click",createNewPlaylist);
    albums.addEventListener("click",showAllAlbums);
    //Playlist Show und Load
    showLoadPlaylist();
}
/* *************** Load Playlist *************** */
function showLoadPlaylist(){
    //LocalStore
    meinPlaylists = localStorage.getItem("playlist");
    /* if (meinPlaylists !== null) {
        showALLPlaylists(meinPlaylists.split(","));
        //JSON Doc. Get
        loadPlaylist();
    }else {
        recoverPlaylistFromDoc();
    } */
    (meinPlaylists !== null) ? showALLPlaylists(meinPlaylists.split(",")) : 0;
    //JSON Doc. Get
    loadPlaylist();
}
function showALLPlaylists(playlistNames){
    playlistContainer.innerHTML = "";
    if (playlistNames.length > 0 ){
        $(playlistContainer).show();
        $(songsContainer).show();
        for (let i=0; i <playlistNames.length; i++){
            showPlaylist(playlistNames[i]);
        }
        //activePlaylist immer das lezte playlist
        activePlaylist = playlistNames[playlistNames.length -1];
        playlistContainer.lastChild.firstChild.classList.add("active");
    }
}

//showPlaylist in playlistContainer
function showPlaylist(playlistName){
    let pContainer =  document.createElement("p");
    let cdImg = document.createElement("img");
    let delButton = document.createElement("button");
    let pName = document.createElement("p");
    cdImg.src = "img/cd_4.png";
    cdImg.alt = "cd";
    cdImg.classList.add("imgCD");
    cdImg.classList.add("fltleft");
     cdImg.addEventListener("click", (event) =>{
         //amb el 0 avisem que venim de le event
        showAllSongsPlaylist("0")
     });
    pContainer.classList.add("clearfix");
    pName.textContent = playlistName;
    pName.classList.add("namePlaylist2");
    delButton.textContent="-";
    delButton.id="delPlaylist"
    delButton.classList.add("addDelPlaylist");
    delButton.addEventListener("click",function(event) {
        delPlaylist();
    });
    pContainer.classList.add("clearfix");
    pContainer.appendChild(cdImg);
    pName.appendChild(delButton);
    pContainer.appendChild(pName);
    //pContainer.appendChild(delButton);
    playlistContainer.appendChild(pContainer);
}

function loadPlaylist(){ 
     $.getJSON({url:"playlist.json",headers:{"Cache-Control":"no-cache"}}).done((data) => {
        jsonPlaylist = data;
        jsonPlaylistsLoaded = true;
        //mostrem les songs de la playlist activa
        //li paso 1 que vol dir que no ve del event (click del imgCD)
        if (meinPlaylists != null){
            showAllSongsPlaylist("1");
         } else {
             //en cas que el LocalStorage estigui buit, pero hi hagi playlists dins
             //el doc JSON, demanem a l usuari si vol que ho recuperem del fitxer.
            if (jsonPlaylist.playlist.length>0){
                let ok = confirm("Do you want to recover the playlist from the file?");
                if (ok){
                    jsonPlaylist.playlist.forEach(function(elem){
                        (meinPlaylists === null)? meinPlaylists=elem.name : meinPlaylists = meinPlaylists+","+elem.name;
                        localStorage.setItem("playlist",meinPlaylists);
                        showALLPlaylists(meinPlaylists.split(","));
                        showAllSongsPlaylist("1");
                    });
                } else {
                    //buidar la jsonPlaylist
                    jsonPlaylist.playlist = [];
                }
            }
        } 
      
    }).fail((jQXHR, error, errorMessage) => {
        //console.log(jQXHR);
        //console.log(error);
        //console.log(errorMessage);
        newPlaylist.setAttribute("disabled","disabled");
        albums.setAttribute("disabled","disabled");
        playlistContainer.classList.add("disabled");
        noteContainer.innerHTML= error +": "+ "playlist.json not found. Please contact the technical service!";
    });
}

/* LocalStorage es buida i volem recuperar del Document JSON */
function recoverPlaylistFromDoc(){
    console.log("recoverPlaylistFromDoc");
}
/* *************** Albums *************** */
function showAllAlbums() {
    noteContainer.innerHTML="";
    i_album=0;
    if (! jsonAlbumsLoaded) {
        loadAlbums();
    } else {
     //showNextAlbums();
    }
    eins.addEventListener("click",showAlbumSongs);
    zwei.addEventListener("click",showAlbumSongs);
    drei.addEventListener("click",showAlbumSongs);
    vier.addEventListener("click",showAlbumSongs);
}

function loadAlbums(){  
    $.getJSON({url:"albums.json",headers:{"Cache-Control":"no-cache"}}).done((data) => {
        jsonAlbums = data;
        jsonAlbumsLoaded = true;
        // EventListener für Button
        document.querySelector("#next").addEventListener("click",showNextAlbums);
        document.querySelector("#previous").addEventListener("click",showPreviousAlbums);  
        showNextAlbums();
    }).fail((jQXHR, error, errorMessage) => {
        //console.log(jQXHR);
        //console.log(error);
        //console.log(errorMessage);
        newPlaylist.setAttribute("disabled","disabled");
        albums.setAttribute("disabled","disabled");
        playlistContainer.classList.add("disabled");
        noteContainer.innerHTML= error +": "+ "album.json not found. Please contact the technical service!";
    });
}
function showAlbum(index,j_container){
    noteContainer.innerHTML="";
    let albumContainer;
    albumContainer = document.querySelector(id_albums_container[j_container]);
    albumContainer.innerHTML = `<p class = "albumName">${jsonAlbums.albums[index].name}</p><p class = "artistName">${jsonAlbums.albums[index].artist}</p><p class="textKlein">${jsonAlbums.albums[index].year}</p>`;
    $(albumsContainer).show();
}
function showNextAlbums(){
    if (last_movement == "previous"){
        i_album +=4;
        (i_album >= jsonAlbums.albums.length) ? i_album = 0 : null;
    }
    for(let j=0;j<4;j++){ 
        showAlbum(i_album, j);
        (i_album < jsonAlbums.albums.length -1) ? i_album++ : i_album=0;
    }
    last_movement="next";
}
function showPreviousAlbums(){
    if (last_movement == "next"){
        (i_album <= 0) ? i_album = jsonAlbums.albums.length : null;
        i_album -=4
    }

    for(let j=3;j>=0;j--){ 
        (i_album <= 0) ? i_album=jsonAlbums.albums.length -1 : i_album--;
        showAlbum(i_album, j);
    }
    last_movement="previous";
}
function showAlbumSongs(){
    noteContainer.innerHTML="";
    songsContainer.innerHTML = "";
    $(playlistContainer).show();
    $(songsContainer).show();
    let albumName = event.currentTarget.childNodes[0].textContent;
    let artistName = event.currentTarget.childNodes[1].textContent;
    let found = jsonAlbums.albums.find(function(elem){
        return (elem.name === albumName && elem.artist === artistName);
    });
    if (typeof found !== "undefined"){
        showAlbumHeaderUndSongs(albumName,artistName,found);
        //addStrips($("#songsContainer div p:odd"));
        addStrips();
    } else {
        noteContainer.textContent = "Album Songs not found";
    }
}
function showAlbumHeaderUndSongs(albumName,artistName,found){
    let albumInfo = document.createElement("p");
    let name = document.createElement("span");
    let artist = document.createElement("span");
    name.textContent = albumName;
    name.classList.add("albumNameInList")
    artist.textContent = artistName;
    artist.classList.add("artistNameInList")
    albumInfo.appendChild(name);
    albumInfo.appendChild(artist);
    albumInfo.classList.add("line");
    songsContainer.appendChild(albumInfo);
    found.songs.forEach(showSongsAlbum);
}
function showSongsAlbum(song,index){
    let songElem = document.createElement("p")
    songElem.innerHTML = `(${index+1})&nbsp;&nbsp;&nbsp;☆&nbsp;&nbsp;&nbsp;<span>${song.title}</span><span>&nbsp;(${song.long})</span>`;
    songElem.lastElementChild.classList.add("textKlein"); //span <-- class
    songElem.addEventListener("dblclick",(event) =>{
        //event.preventDefault(); //link <a>
        addSongToPlaylist();
    });
    
    songsContainer.appendChild(songElem);
}
function addStrips(){
    let lines = $("#songsContainer div p:odd")
    for (let i=0; i<lines.length;i++) {
        lines[i].classList.add("strips");
    };
}
function delStrips(){
    let lines = $("#songsContainer div p")
    for (let i=0; i<lines.length;i++) {
        lines[i].classList.remove("strips");
    };
}
/* *************** Add Song To Playlist *************** */
function addSongToPlaylist(){
    noteContainer.innerHTML = "";
    if (meinPlaylists == null){
        noteContainer.innerHTML = "no Playlist";
        return;
    }
    if (activePlaylist == null){
        noteContainer.innerHTML = "no Playlist active";
        return;
    }

    //2.-JSON Dokument
    if (jsonPlaylistsLoaded) {
        let album = event.currentTarget.parentNode.firstChild.children[0].textContent;
        let artist = event.currentTarget.parentNode.firstChild.children[1].textContent;
        let song = event.currentTarget.firstElementChild.textContent

        let songsObj = {
            "albumName": album,
            "artist": artist,
            "songTitle":song
        };
        let i = Array.from(jsonPlaylist.playlist).findIndex(function(elem){
             return elem.name == activePlaylist;
        }); 
        let found = jsonPlaylist.playlist[i].songs.find(function(elem){
            return (elem.albumName == songsObj.albumName &&
                    elem.artist == songsObj.artist &&
                    elem.songTitle == songsObj.songTitle);
        });
        if (found){
            noteContainer.innerHTML = songsObj.songTitle + ": already in Playlist"
            return;
        }

        jsonPlaylist.playlist[i].songs.push(songsObj);
        savePlaylistDoc(jsonPlaylist); 
    } else {
        noteContainer.innerHTML = "No playlist File";
    }
}
/* *************** New Playlist *************** */
function createNewPlaylist(){
    noteContainer.innerHTML = "";
    event.target.setAttribute("disabled","disable");
    $(playlistContainer).show();
    $(songsContainer).show();
    let p =  document.createElement("p");
    let cdImg = document.createElement("img");
    let nameInput = document.createElement("input");
    let okButton = document.createElement("button");
    cdImg.src = "img/cd_4.png";
    cdImg.alt = "cd";
    cdImg.classList.add("imgCD");
    cdImg.classList.add("fltleft");
    nameInput.type="text";
    nameInput.placeholder="Playlist name";
    nameInput.size="20";
    nameInput.maxLength="20";
    //nameInput.pattern="[A-Za-z0-9ÖÄÜöäü]";
    nameInput.required = true;
    nameInput.setAttribute("required", "required");
    nameInput.classList.add("namePlaylist");
    okButton.textContent="+";
    okButton.id="addPlaylist"
    okButton.classList.add("addDelPlaylist");
    okButton.addEventListener("click",function(event) {
        //check input - (sondezeichen - noch nicht) FER
        //check name not exists FER
        let newPL = event.currentTarget.previousSibling.value.trim();
        if ( newPL == "") {
            noteContainer.innerHTML = "No Name - Leerzeichen";
            return;
        }
        //si tenim Playlist cal comprovar que la nova no existeixi ja
        meinPlaylists = localStorage.getItem("playlist");
        if (meinPlaylists != null) {
            let a_meinPlaylists =  meinPlaylists.split(",");
            if (a_meinPlaylists.indexOf(newPL) != -1) {
                noteContainer.innerHTML = newPL+": Playlist already exists";
                return;
            }
        };
        noteContainer.innerHTML = "";
        //Playlist --> LocalStorage i JSON Doc.
        addPlaylist();
        //Playlist --> playlistContainer HTML
        playlistContainer.innerHTML="";
        //torno a repassar la playlist per desactivar-les totes i activar la que
        //donem d alta
        showALLPlaylists(meinPlaylists.split(","));
        //argument = 1 --> la crida es fa desde fora de l event click
        showAllSongsPlaylist("1"); 
        newPlaylist.removeAttribute("disabled"); 
    });
    p.classList.add("clearfix");
    p.appendChild(cdImg);
    p.appendChild(nameInput);
    p.appendChild(okButton);
    playlistContainer.appendChild(p);
}
function addPlaylist(){
    noteContainer.innerHTML="";
    //1.-LocalStorage
    let nameNewPlaylist = (event.currentTarget.previousSibling.value).trim();
    (meinPlaylists === null)? meinPlaylists=nameNewPlaylist : meinPlaylists = meinPlaylists+","+nameNewPlaylist;
    localStorage.setItem("playlist",meinPlaylists);
    //2.-JSON Dokument
    if (jsonPlaylistsLoaded) {
        let playlistObj = {
            "name": nameNewPlaylist,
            "songs":[]
        };
        jsonPlaylist.playlist.push(playlistObj);
        savePlaylistDoc(jsonPlaylist);
    } else {
        noteContainer.innerHTML = "No playlist File";
    }
     //activePlaylist immer das lezte/neue playlist
     activePlaylist = nameNewPlaylist;
     playlistContainer.childNodes.forEach(function(elem){
        elem.firstChild.classList.remove("active");
    });
    playlistContainer.lastChild.firstChild.classList.add("active");
}
function savePlaylistDoc(objStr){
    //let xhr = new XMLHttpRequest(); 
    let xhr = createXHR();// AJAX Object
    xhr.onload = function() {
        if(xhr.status !== 200) {
            noteContainer.textContent = "(2) - Verarbeitungsfehler! try it again" + xhr.status 
            return;
        } 
        let phpAnswer = xhr.responseText;
        console.log(phpAnswer);
    };
    xhr.open("POST","myScript.php");
    xhr.setRequestHeader("Content-Type","application/json");
    xhr.send(JSON.stringify(objStr));
}
/* *************** Show All Songs in Playlist *************** */
function showAllSongsPlaylist(from="0"){
    noteContainer.innerHTML="";
    songsContainer.innerHTML = "";
    if (from == "0") {
        //desmarco tots els elements de la playlit per resaltar el que es actiu
        playlistContainer.childNodes.forEach(function(elem){
            elem.firstChild.classList.remove("active");
        });
        event.currentTarget.classList.add("active");
        activePlaylist = event.currentTarget.nextSibling.firstChild.textContent;
    }
    let found = Array.from(jsonPlaylist.playlist).find(function(elem){
        return elem.name == activePlaylist;
    });

    if (typeof found !== "undefined"){
        showPlaylistHeader(activePlaylist);
        found.songs.forEach(showSongsPlaylist);
        //addStrips($("#songsContainer div p:odd"));
        addStrips();
        //activePlaylist = playlist;
        } else {
            noteContainer.textContent = "415 - Playlist not found: "+activePlaylist;
        }
}
function showPlaylistHeader(pHeader){
    let header = document.createElement("p");
    header.textContent = pHeader;
    header.classList.add("header");
    header.classList.add("line");
    songsContainer.appendChild(header);
}
function showSongsPlaylist(song,index){
    let songElem = document.createElement("p")
    songElem.innerHTML = `(${index+1})&nbsp;&nbsp;&nbsp;☆&nbsp;&nbsp;&nbsp;<span>${song.albumName}</span>&nbsp;-&nbsp;&nbsp;<span>${song.artist}</span>&nbsp;-&nbsp;&nbsp;<span>${song.songTitle}</span>`;
    let delButton = document.createElement("button");
    delButton.textContent="-";
    delButton.id="delSongFromPlaylist"
    delButton.classList.add("delSongFromPlaylist");
    delButton.addEventListener("click",function(event) {
        delSongFromPlaylist();
    });
    songElem.appendChild(delButton);
    songsContainer.appendChild(songElem);
   
}
/* *************** Delete Song form Playlist *************** */
function delSongFromPlaylist(){
   
    let albumName = event.currentTarget.parentNode.children[0].textContent;
    let artist = event.currentTarget.parentNode.children[1].textContent;
    let songTitle = event.currentTarget.parentNode.children[2].textContent;
    
    //1.-buscar la Playlist dins el jsonPlaylist. 
    let index = jsonPlaylist.playlist.findIndex(function(elem){
        return elem.name === activePlaylist;
    });
   
    if(index != -1){
        //2.- Find und Remove SONG from jsonPlaylist Doc 
        let indexFound = jsonPlaylist.playlist[index].songs.findIndex(function(elem){
            return (elem.albumName == albumName &&
                    elem.artist == artist &&
                    elem.songTitle == songTitle);
        })
        if (indexFound != -1){
            jsonPlaylist.playlist[index].songs.splice(indexFound,1);
            savePlaylistDoc(jsonPlaylist);
            event.currentTarget.parentNode.remove();
        } else noteContainer = "Sorry. No Song in JSON Doc.";
    } else noteContainer = "Sorry. No Playlist in JSON Doc.";

    delStrips();
    //addStrips($("#songsContainer div p:odd"));
    addStrips();
}

/* *************** Delete Playlist *************** */
function delPlaylist(){
    
    let playlist = event.currentTarget.previousSibling.textContent;
    let sure = confirm("Playlist:  "+playlist+"  will be erased, ok?");
    if (! sure) return;
    //Find und Remove from jsonPlaylist Doc
    let i = jsonPlaylist.playlist.findIndex(function(elem){
            return elem.name === playlist;
    });
    //FER comprovar si i es -1
    jsonPlaylist.playlist.splice(i,1);
    savePlaylistDoc(jsonPlaylist);

    //Remove from localStorage und Update
    let meinPlaylistsArray = meinPlaylists.split(",");
    let index = meinPlaylistsArray.indexOf(playlist);
    meinPlaylistsArray.splice(index,1);
    
    if (songsContainer.firstChild != null){
        //si en el songsContainer hi ha la llista de cancons de la playlist
        //que esborrem tb cal esborrar el seu contingut
        if (playlist == songsContainer.firstChild.firstChild.textContent){
            songsContainer.innerHTML = "";
        }
    }
    let parentActivElem = event.currentTarget.parentNode.parentNode.parentNode.lastChild;
    let numChilds = event.currentTarget.parentNode.parentNode.parentNode.children.length;
    //El prolema el tenim si el que esborrem es l ultim element
    //llavors el penultim element passa a ser actiu. Pero tb hem de tenir en compte
    //de que e que esborrem no sigui l ultmi element, es a dir que hi hagi mes playlists
    if (activePlaylist == parentActivElem.lastChild.firstChild.textContent &&
        numChilds > 1){
        parentActivElem = event.currentTarget.parentNode.parentNode.parentNode.children[numChilds-2];
    }
    event.currentTarget.parentNode.parentNode.remove();
    if (meinPlaylistsArray.length>0){
        localStorage.setItem("playlist",meinPlaylistsArray);
        meinPlaylists = localStorage.getItem("playlist"); 
        //cal posar una altra playlist com a activa i aquesta sera l ultima de la llista
        // activePlaylist = null;
        //si la playlist que esborrem es l activa, cal activar-ne una altre
        if (playlist == activePlaylist){
            parentActivElem.firstChild.classList.add("active");
            activePlaylist = parentActivElem.lastChild.firstChild.textContent;
            showAllSongsPlaylist("1"); 
        }
    } else{
        localStorage.removeItem("playlist");
        meinPlaylists = null;
    };
}


init();