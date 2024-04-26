/**
 * File     -   page-styles.js 
 * Author   -   Raj Rai
 * Date     -   Apr-16-24
 **/
import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',	
    },
    picker: {
        width: '80%',
        marginTop: 10,
    },
    infoView: {
        marginTop:180,
    },
    infoText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color:'purple',
    },
    buttonView: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems:'center'
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 4,
        elevation: 3,
        backgroundColor:'cyan'
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    grid: {
        height: '60%',
        width:'95%',
        marginTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
},
    cardText: {
        fontSize: 28,
    },
    winMessage: {
        fontSize: 24,
        color: 'green',
        margin: 20,
    },

});
export default styles;