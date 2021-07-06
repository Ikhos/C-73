import React from 'react';
import { Text, View, TouchableOpacity, KeyboardAvoidingView, TextInput, ToastAndroid, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import db from "../config";

export default class YourBooks extends React.Component {
    constructor() {
        super();
        this.state = {
            hasCameraPerms: null,
            isScanned: false,
            scannedBookID: "",
            scannedStudentID: "",
            buttonState: "not clicked",
            transactionMsg: ""
        }
    }

    handleBarcodeScan = async ({type, data}) => {
        const buttonState = this.state.buttonState;
        if(buttonState === 'bookID'){
            this.setState({
                isScanned: true,
                buttonState: "clicked",
                scannedBookID: data
            })
        }
        else if(buttonState === 'studentID'){
            this.setState({
                isScanned: true,
                buttonState: "clicked",
                scannedStudentID: data
            })
        }
        
    }

    manageIssues = async () => {
        var message = null;
        db.collection("transaction").add({
            studentID: this.state.scannedStudentID,
            bookID: this.state.scannedBookID,
            date: firebase.firestore.Timestamp.now().toDate(),
            transactionType: "issue"
        });
        db.collection('books').doc(this.state.scannedBookID).update({
            bookAvailable: false
        });
        db.collection('student').doc(this.state.scannedStudentID).update({
            studentBookCount: firebase.firestore.FieldValue.increment(1)
        });
        this.setState({
            scannedBookID: "",
            scannedStudentID: ""
        });
    }

    manageReturns = async () => {
        var message = null;
        db.collection("transaction").add({
            studentID: this.state.scannedStudentID,
            bookID: this.state.scannedBookID,
            date: firebase.firestore.Timestamp.now().toDate(),
            transactionType: "return"
        });
        db.collection('books').doc(this.state.scannedBookID).update({
            bookAvailable: true
        });
        db.collection('student').doc(this.state.scannedStudentID).update({
            studentBookCount: firebase.firestore.FieldValue.increment(-1)
        });
        this.setState({
            scannedBookID: "",
            scannedStudentID: ""
        });
    }

    checkBookOwner = async () => {
        var bookRef = db.collection("transaction").where("bookID", "==", this.state.scannedBookID).limit(1).get();


        var isStudentEligible = "";
        bookRef.docs.map(
            (doc) => {
                var lastTransaction = doc.data();
                if(lastTransaction.studentID === this.state.scannedStudentID){
                    isStudentEligible = true;   
                }
                else{
                    isStudentEligible = false;
                    Alert.alert("This book cannot be returned by this student.");
                    this.setState({
                        scannedBookID: "",
                        scannedStudentID: ""
                    });
                }
            }
        );
        

        return isStudentEligible;
    }

    checkBookAvailable = async () => {
        var bookRef = db.collection("books").where("bookID", "==", this.state.scannedBookID).get();

        var transactionType = "";
        if(bookRef.docs.length === 0){
            transactionType = false;
        }
        else{
            bookRef.docs.map(
                (doc) => {
                    var book = doc.data();
                    if(book.bookAvailable){
                        transactionType = "issue";
                    }
                    else{
                        transactionType = "return";
                    }
                }
            );
        }

        return transactionType;
    }

    checkStudentBookCount = async () => {
        const studentRef = db.collection("student").where("studentID", "==", this.state.scannedStudentID).get();

        var isStudentEligible = null;
        if(studentRef.docs.length === 0){
            this.setState({
                scannedBookID: "",
                scannedStudentID: ""
            });

            Alert.alert("Invalid Student ID.");
        }
        else{
            studentRef.docs.map(
                (doc) => {
                    var student = doc.data();
                    if(student.studentBookCount < 3) {
                        isStudentEligible = true;
                    }
                    else{
                        isStudentEligible = false;
                        Alert.alert("Maximum number of books checked out.");
                        this.setState({
                            scannedBookID: "",
                            scannedStudentID: ""
                        });
                    }
                }
            );
        }
        return isStudentEligible;
    }

    handleTransaction = async () => {
        /*var transactionMsg = null;
        db.collection("books").doc(this.state.scannedBookID).get().then(
            (doc) => {
                var book = doc.data();
                if(book.bookAvailable){
                    this.manageIssues();
                    //transactionMsg = "book issued"
                    ToastAndroid.show(transactionMsg, ToastAndroid.SHORT);
                }
                else{
                    this.manageReturns();
                    //transactionMsg = "book returned"
                    ToastAndroid.show(transactionMsg, ToastAndroid.SHORT);
                }
            }
        )
        this.setState({
            transactionMsg: transactionMsg
        });*/

        var transactionType =  await this.checkBookAvailable();
        if(!transactionType){
            Alert.alert("Invalid Book ID.");
            this.setState({
                scannedBookID: "",
                scannedStudentID: ""
            });
        }
        else if(transactionType === "issue") {
           var isStudentEligible = await this.checkStudentBookCount();
            if(isStudentEligible){
                this.manageIssues();
                Alert.alert("Book sucsessfully issued")
            }
        }
        else if(transactionType === "return") {
            var isStudentEligible = await this.checkBookOwner();
             if(isStudentEligible){
                 this.manageReturns();
                 Alert.alert("Book sucsessfully returned")
             }
         }
    }

    camPermission = async () => {
        const status = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPerms : status = "granted",
            buttonState: "clicked"
        })
    }

    render() {
        const hasCameraPerms = this.state.hasCameraPerms;
        const isScanned = this.state.isScanned;
        const buttonState = this.state.buttonState;

        if(buttonState === "clicked" && hasCameraPerms === true) {
            return(
                <BarCodeScanner onBarCodeScanned={isScanned ? isScanned = undefined : this.handleBarcodeScan} />
            )
        }
        else {
            return(
                <KeyboardAvoidingView behavior="padding" enabled > 
                    <View>
                        <Text> Your Checkouts And Returns </Text>
                        <Text> hasCameraPerms === true ? this.state.scannedData : "Request Camera Permissions" </Text>
                        <TextInput onChangeText={text => this.setState({ scannedBookID: text })} value={this.state.scannedBookID} > </TextInput>
                        <TextInput onChangeText={text => this.setState({ scannedStudentID: text })} > value={this.state.scannedStudentID} </TextInput>
                        <TouchableOpacity onPress={this.camPermission()} > <Text> Scan QR Code </Text> </TouchableOpacity>
                        <TouchableOpacity onPress={this.handleTransaction()} > <Text> Submit </Text> </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )
        }
    }

}