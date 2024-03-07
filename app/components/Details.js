import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function AdoptionDetail() {
  const handleAdopt = (option) => {
    console.log('Adopting option:', option);
  };

  return (
    <ScrollView>
      <View style={styles.container}> 
             <Image source={require('../../assets/images/pawlink1.png')} style={styles.logo} />  
      
          {/* Add your additional image here */}
          <Image source={require('../../assets/images/dog3.jpg')} style={styles.additionalImage} />
        
        <View style={styles.buttonContainer}>
          <Text style={styles.Texts}>Do you want to have veterinarian assistance before adopting procedure?</Text>
          
          <Link href={"../components/Vetenarian"} className='bg-blue-700 py-3 rounded-lg px-10 mt-5 mb-3' onPress={() => handleAdopt('option1')} >
            <Text style={styles.buttonText}>Yes I need</Text>
          </Link>
    
          <Link href={"../components/Identifier"} className='bg-red-600 py-3 rounded-lg px-11' onPress={() => handleAdopt('option2')}>
            <Text style={styles.buttonText}>No I'don't</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 116,
    height: 96,
    top: 0,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  
  additionalImage: {
    flex: 1,
    width: 307,
    height: 273,
    resizeMode: 'cover',
    borderRadius:10
  },
  Texts: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight:'bold',
    marginTop:20
    
  },

  buttonContainer: {
    flexDirection: 'column', 
    alignItems: 'center', 
    width: '100%',
    padding: 10,
    borderColor: '#888',
    shadowColor: "#000",
    width: 362,
    height: 386,
    backgroundColor: 'white',
    marginTop: 15,
    borderRadius: 10,
    elevation:4
  },
  button1: {
    width: 193,
    height: 47,
    borderRadius: 10,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    top: 40,
  },
  button2: {
    width: 193,
    height: 47,
    borderRadius: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    top: 80,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
});