/**
 * Credit   -   Grehard, Stephen, Someone
 */
import * as React from 'react';
import { View, Alert, Text, Pressable, Button, Vibration } from 'react-native';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import Styles from '../styles/page-styles';
import { Audio } from 'expo-av';
import FlipCard from 'react-native-flip-card';

function GamePage({ navigation, route }) {

    const generateCardSet = (difficulty) => {
        const baseSet = ['🥩', '❣️', '🐕', '🎾', '🥎', '🌍', '🐘', '🐪', '🐃', '🦁', '🦁', '📱'];
        let setLength;

        switch (difficulty) {
            case 'easy': setLength = 6; break;
            case 'medium': setLength = 8; break;
            case 'hard': setLength = 12; break;
            default: setLength = 6;
        }

        const gameSet = baseSet.slice(0, setLength).flatMap(i => [i, i]);
        gameSet.sort(() => Math.random() - 0.5);

        return gameSet.map((face, index) => ({
            id: index,
            face,
            matched: false,
            flipped: false,
            clickable: true
        }));
    };

    const SIX_IN_MS = 600; // VICTORY VIBRATION
    const [colorC, setColorC] = useState('black')

    const { difficulty } = route.params;
    const [cards, setCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        setCards(generateCardSet(difficulty));
    }, [difficulty]);

    // Alert a victory
    useEffect(() => {
        if (score * 2 === cards.length && cards.length > 0) {
            Alert.alert("Congratulations!", "You've won the game!", [{ text: "OK" }]);
            playSound(0);
            Vibration.vibrate(SIX_IN_MS)
        }
    }, [score, cards.length]);

    // Add score to database after score has increased
    const [match, setMatch] = useState(0)
    useEffect(() => {
        if (score == 0) { setColorC('black') }
        if (score != 0) { addData(score) }
    }, [score, match])

    // Compare selected images and do actions acordingly
    const handlePress = (index) => {
        Vibration.vibrate(5);

        if (selectedCards.length == 2 || cards[index].flipped) return;

        const newCards = [...cards];
        newCards[index].flipped = true;
        setCards(newCards);

        let newSelectedCards = [...selectedCards, index];
        if (newSelectedCards.length == 2) {
            const firstCard = cards[newSelectedCards[0]];
            const secondCard = cards[newSelectedCards[1]];
            if (firstCard.face == secondCard.face) {
                console.log("Matched")
                playSound(1)
                setColorC('green')
                setScore(score => score + 1);
                setMatch(match => match + 1)
                setCards(prevCards => prevCards.map(card =>
                    card.face == firstCard.face ? { ...card, matched: true, flipped: true, clickable: false } : card
                ));
                setSelectedCards([]);
            } else {
                console.log("No match")
                setTimeout(() => {
                    playSound(2)
                    setCards(prevCards => prevCards.map(card =>
                        newSelectedCards.includes(card.id) ? { ...card, flipped: false, clickable: true } : card
                    ));
                    setSelectedCards([]);
                    newSelectedCards = null;
                }, 500);

            }
        } else {
            setSelectedCards(newSelectedCards);
        }
    };

    // Audio
    const [soundList, setSoundList] = useState([
        { sound: null }, { sound: null }, { sound: null }
    ])
    // Sound
    const win = require('../assets/sfx/win.mp3');
    const matched = require('../assets/sfx/matched.mp3')
    const incompatible = require('../assets/sfx/incompatible.mp3')

    const loadSoundList = () => {
        loadSound(0, win);
        loadSound(1, matched)
        loadSound(2, incompatible)
    }

    const loadSound = async (id, uri) => {
        const { sound } = await Audio.Sound.createAsync(uri);
        let newA = { ...soundList }
        if (soundList[id].sound == null) {
            newA[id].sound = sound;
            setSoundList(newA)
            console.log("loaded sound at index", id)
        }
    }

    const playSound = async (id) => {
        try {
            if (soundList[id].sound != null) {
                await soundList[id].sound.replayAsync();
            }
            if (soundList[id].sound == null) {
                loadSoundList();
            }
        } catch (e) {
            console.log(e)
        };
    }

    // unload a sound
    const unloadSound = async () => {
        let x = 0;
        while (x < soundList.length) {
            // stop and unload
            if (soundList[x].sound != null) {
                await soundList[x].sound.stopAsync();
                await soundList[x].sound.unloadAsync();
                console.log("Unloaded sound")
            }
            // load after unload to be able to play sound
            loadSoundList();
            x++
        }
    }

    useEffect(() => {
        loadSoundList()
        return soundList.sound
            ? () => {
                unloadSound()
            }
            : undefined;

    }, [soundList.sound])

    // For database
    const db = route.params.db;

    const addData = (score_) => {
        if (score_ > 0 ) {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "insert into record values (?)",
                        [score_],
                        () => console.log("added score:", score_),
                        (_, error) => console.log(error)
                    )
                },
                (_, error) => console.log('addData() failed: ', error),
            )
        }
    }

    // Reset location of cards and score
    const restartGame = () => {
        setCards(generateCardSet(difficulty));
        setSelectedCards([]);
        setScore(0);
    };

    const dataFileName = 'datafile.json';

    const loadState = async () => {
        try {
            // get the string
            const currentStateString = await FileSystem.readAsStringAsync(
                FileSystem.documentDirectory + dataFileName
            );
            
            currentState = JSON.parse(currentStateString)
            // extract all the saved states
            setScore(currentState.score);
            setCards(currentState.card)
        } catch (e) {
            console.log(FileSystem.documentDirectory + dataFileName + e);
            // probably there wasn't a saved state, so make one for next time?
            saveState();
        }
    }

    /**
     * This function will save the data as a json string 
     */
    const saveState = async () => {
        // build an object of everything we are saving
        const currentState = { "score": score, "card": cards };
        try {
            // write the stringified object to the save file
            await FileSystem.writeAsStringAsync(
                FileSystem.documentDirectory + dataFileName,
                JSON.stringify(currentState)
            );
        } catch (e) {
            console.log(FileSystem.documentDirectory + dataFileName + e);
        }
    }

    // load on app load, save on app unload
    useEffect(() => {
        loadState();
        return () => { saveState }
    }, [])

    return (
        <View style={Styles.container}>
            <View style={Styles.grid}>
                {cards.map((card, index) => (
                <FlipCard
                    key={card.id}
                    friction={6}
                    style={Styles.card}
                    perspective={100}
                    flipHorizontal={true}
                    flipVertical={false}
                    flip={card.flipped}
                    clickable={card.clickable}
                    
                >
                    {/* Front */}
                        <View style={Styles.imageContainer}>
                            <Pressable onPress={() => handlePress(index)}>
                                <Text style={Styles.cardText}>❓</Text>
                            </Pressable>
                    </View>

                    {/* Back */}
                    <View style={Styles.imageContainer}>                  
                                <Text style={Styles.cardText}>{card.face}</Text>
                </View>
                </FlipCard>
                ))}
            </View>
            {score * 2 === cards.length && cards.length > 0 ? (
                <>
                    <Text style={Styles.winMessage}>You Won! 🎉</Text>
                </>
            ) : null}
            <Text style={{color:colorC}} >Scored: {score} pts</Text>
            <View style={Styles.buttonView}>
                <Pressable style={Styles.button} onPress={restartGame}><Text style={Styles.buttonText}>Reset</Text></Pressable>
                <Pressable
                    style={[Styles.button, { backgroundColor: 'green' }]}
                    onPress={() => navigation.navigate('Home')}
                ><Text style={Styles.buttonText}>Home</Text></Pressable>
                <Button title="Save State" onPress={saveState} />
                <Button title="Load State" onPress={loadState} />
            </View>
        </View>
    );
}
export default GamePage;