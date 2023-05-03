import React, { Component }from 'react';
import { Dimensions, StyleSheet, Text, View, StatusBar, Alert, TouchableOpacity, Image } from "react-native";
import Matter from "matter-js";
import { GameEngine } from "react-native-game-engine";
import Bird from "./Components/Bird";
import Floor from "./Components/Floor";
import Physics, { resetPipes } from "./Components/Physics";
import Constants from "./Constants/Constants";
import Images from "./assets/Images";

export default class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      running: true,
      score: 0,
    };
    
    this.gameEngine = null;

    this.entities = this.setupWorld();
  }

  setupWorld = () => {
    let engine = Matter.Engine.create({ enableSleeping: false });
    let world = engine.world;
    engine.gravity.y = 0.0;

    let bird = Matter.Bodies.rectangle( Constants.MAX_WIDTH / 2, Constants.MAX_HEIGHT / 2, Constants.BIRD_WIDTH, Constants.BIRD_HEIGHT);
    
    let floor1 = Matter.Bodies.rectangle(
      Constants.MAX_WIDTH / 2,
      Constants.MAX_HEIGHT - 25,
      Constants.MAX_WIDTH + 4, 50,
      { isStatic: true }
    );

    let floor2 = Matter.Bodies.rectangle(
        Constants.MAX_WIDTH + (Constants.MAX_WIDTH / 2),
        Constants.MAX_HEIGHT - 25,
        Constants.MAX_WIDTH + 4, 50,
        { isStatic: true }
    );

    Matter.World.add(world, [bird, floor1, floor2]);

    Matter.Events.on(engine, "collisionStart", (event) => {
      let pairs = event.pairs;

      this.gameEngine.dispatch({ type: "game-over"});
    });

    return {
      physics: { engine: engine, world: world },
      floor1: { body: floor1, renderer: Floor },
      floor2: { body: floor2, renderer: Floor },
      bird: { body: bird, pose: 1, renderer: Bird },
    }
  }

  onEvent = (e) => {
    if (e.type === "game-over") {
      this.setState({
        running: false
      })
    } else if (e.type === "score") {
      this.setState({
        score: this.state.score + 1
      })
    }
  } 

  reset = () => {
    resetPipes();
    this.gameEngine.swap(this.setupWorld());
    this.setState({
      running: true,
      score: 0
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Image source={Images.background} style={styles.backgroundImage} resizeMode="stretch" />
        <GameEngine
          ref={(ref) => { this.gameEngine = ref; }}
          style={styles.gameContainer}
          systems={[Physics]}
          running={this.state.running}
          onEvent={this.onEvent}
          entities={this.entities}>
          <StatusBar hidden={true} />
        </GameEngine>
        <Text style={styles.score}>{this.state.score}</Text>
        {!this.state.running && <TouchableOpacity style={styles.fullScreenButton} onPress={this.reset}>
          <View style={styles.fullScreen}>
            <Text style={styles.gameOverText}>Game Over!</Text>
          </View>
        </TouchableOpacity>}
      </View>
    )
  }  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  backgroundImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: Constants.MAX_WIDTH,
    height: Constants.MAX_HEIGHT,
  },

  gameContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  fullScreenButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0, 
    flex: 1
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0, 
    backgroundColor: 'black',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    position: 'absolute',
    color: 'white',
    fontSize: 72,
    top: 50,
    left: Constants.MAX_WIDTH / 2 - 20, 
    textShadowColor: '#444444',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
    // fontFamily: 'helvetica-times-regular',
  },
  gameOverText: {
    color: 'white',
    fontSize: 36
  }
});
