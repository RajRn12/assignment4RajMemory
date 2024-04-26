import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { View,Text, LogBox, Pressable} from 'react-native';
import { useEffect, useState } from 'react';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GamePage from './components/GamePage'
import Styles from './styles/page-styles';
import { Picker } from '@react-native-picker/picker'
import { openDatabase } from 'expo-sqlite';

// Ignore warnings as they don't affect anything
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

const db = openDatabase('record2.db');

function HomeScreen({ navigation }) {
    const [difficulty, setDifficulty] = useState('easy');

    // Create datatable
    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                "create table if not exists record (score integer);",
                () => console.log("Table is successfully created")
            ),
                (_, error) => console.log(error),
                () => console.log("Table exists or was created")
        })
    }, []);

    return (
        <View style={Styles.container}>
            <View style={Styles.infoView}>
                <Text style={Styles.infoText}>Memory Match: Find all matching pairs to win a game - Choose a difficulty to start with</Text>
            </View>
                <Picker
                    selectedValue={difficulty}
                    style={Styles.picker}
                    onValueChange={(itemValue) => setDifficulty(itemValue)}
                    mode="dropdown"
                >
                    <Picker.Item label="Easy (3x2)" value="easy" />
                    <Picker.Item label="Medium (4x3)" value="medium" />
                    <Picker.Item label="Hard (4x4)" value="hard" />
            </Picker>
            <View style={Styles.buttonView}>
                <Pressable
                    style={[Styles.button, { backgroundColor: 'green' }]}
                    onPress={() => navigation.navigate('Game', { difficulty, db:db })}
                ><Text style={Styles.buttonText}>Start Game</Text></Pressable>
            </View>
        </View>
    );
}

const Stack = createNativeStackNavigator();
function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        headerBackVisible: false,
                        headerStyle: {
                            backgroundColor: 'rgb(37, 150, 190)',
                        },
                        headerTintColor: '#fff',
                        headerTitleAlign: 'center',
                    }}
                />
                <Stack.Screen
                    name="Game"
                    component={GamePage}
                    options={{
                        headerBackVisible: false,
                        headerStyle: {
                            backgroundColor: 'rgb(37, 150, 190)',
                        },
                        headerTintColor: '#fff',
                        headerTitleAlign: 'center',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
export default App;
