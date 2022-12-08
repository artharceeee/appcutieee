import { Component, OnInit } from '@angular/core';
import * as firebase from "firebase";

@Component({
    selector: 'app-map',
    templateUrl: './map.page.html',
    styleUrls: ['./map.page.scss'],
})

export class MapPage implements OnInit {
    lat: number;
    lng: number;
    uid = firebase.auth().currentUser.uid;
    geoFire: any;
    isLoaded: boolean = false;
    usersAround: Array<any> = [];

    constructor() {
        const geofire = require('geofire');
        var dbRef = firebase.database().ref("locations");
        this.geoFire = new geofire.GeoFire(dbRef);
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                this.lat = position.coords.latitude;
                this.lng = position.coords.longitude;
                this.geoFire.set(this.uid, [this.lat, this.lng]).then(() => {
                    this.getUsersAround();
                });
            });
        }
    }

    getUsersAround() {
        this.geoFire.query({
            center: [this.lat, this.lng],
            radius: 1.609 //kilometers
        }).on("key_entered", (key, location, distance) => {
            firebase.database().ref("users/" + key).once("value", snap => {
                this.usersAround.push({ ...snap.val(), location: location, distance: distance });
                this.isLoaded = true;
            });
        });
    }

    convert(distance) {
        //distance is something like 1.694843322102
        //we convert it to 1.6 km

        //if distance is less than one 
        //return value in meters
        if (distance <= 1) {
            return Number(distance * 1000).toFixed(2) + " m away";
        }

        //else return value in kilometers
        else {
            return Number(distance).toFixed(2) + " km away";
        }
    }

    ngOnInit(): void {
      
    }
}
