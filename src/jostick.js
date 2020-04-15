import React, { Component } from "react";
import { Animated, View, StyleSheet, PanResponder, Text } from "react-native";

export default class Jostick extends Component {
  // pan = new Animated.ValueXY();

  state = {
    x: null,
    y: null,
    start: false,
  }

  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      
    },
    onPanResponderMove: (evt, gestureState) => {
      const { x0, y0, moveX, moveY, dx, dy } = gestureState;
      this.setState({
        x: this.initX + dx,
        y: this.initY + dy,
      });
      if (this.props.setPosition) {
        this.props.setPosition(
          {x: dx / this.initX, y: -dy / this.initY}
        );
      }
      // console.log('evt', dx, dy);
    },
    onPanResponderRelease: () => {
      this.setState({x:this.initX, y: this.initY});
      if (this.props.setPosition) {
        this.props.setPosition(
          {x: 0, y: 0}
        );
      }
    },


  });


  render() {
    return (
      <View style={styles.container}
        {...this.panResponder.panHandlers}
      >
        <View
          style={this.state.x&&this.state.y&&{
            top: this.state.y,
            left: this.state.x,
            position: 'absolute', 
          }}
          
          onLayout={event => {
              if(!this.state.start) {
                const layout = event.nativeEvent.layout;
                console.log('height:', layout.height);
                console.log('width:', layout.width);
                console.log('x:', layout.x);
                console.log('y:', layout.y);
                this.initX = layout.x;
                this.initY = layout.y;
                this.setState({x:layout.x , y:layout.y, start: true});

              }
            }}
        >
          <View style={styles.box}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth:1,
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "bold"
  },
  box: {
    height: 50,
    width: 50,
    backgroundColor: "blue",
    borderRadius: 25
  }
});
