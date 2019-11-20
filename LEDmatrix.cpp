/* This program makes all LED's on the microbit sequentially blink using an interrupt routine.
Last edited: 30.09.2019.
Author: Kemal Altwlkany */

#include "mbed.h"


//Declaring an array of pointers to hold all columns and rows
DigitalOut* columns[9];
DigitalOut* rows[3];

//Just some sweaty work that had to be done since the library from Lancester does 
// not work. Basically, I just map all anodes and cathodes to adequate indices in arrays
DigitalOut col1(P0_4, 1);
DigitalOut col2(P0_5, 1);
DigitalOut col3(P0_6, 1);
DigitalOut col4(P0_7, 1);
DigitalOut col5(P0_8, 1);
DigitalOut col6(P0_9, 1);
DigitalOut col7(P0_10, 1);
DigitalOut col8(P0_11, 1);
DigitalOut col9(P0_12, 1);

DigitalOut row1(P0_13, 0);
DigitalOut row2(P0_14, 0);
DigitalOut row3(P0_15, 0);

void Initialize(){
    columns[0] = &col1;
    columns[1] = &col2;
    columns[2] = &col3;
    columns[3] = &col4;
    columns[4] = &col5;
    columns[5] = &col6;
    columns[6] = &col7;
    columns[7] = &col8;
    columns[8] = &col9;
    rows[0] = &row1;
    rows[1] = &row2;
    rows[2] = &row3;
}


//This function first makes sure to turn off all LEDs, and afterwards turns on
//one LED. The LED which is turned on is identified by its anode/row - (r)
// and cathode/column - (c)
void turn_LED_on(int r, int c){
    for(int i=0; i<3; i++)
        *rows[i] = 0;
    for(int i=0; i<9; i++)
        *columns[i] = 1;
    *columns[c] = 0;
    *rows[r] = 1;
    wait(0.01);        
}

void turn_off_all_LEDs(){
    for(int i=0; i<3; i++)
        *rows[i] = 0;
    for(int i=0; i<9; i++)
        *columns[i] = 1;
}
        
    
/* The int. fun. gets called every second, and it does the following: it turns on
every LED for a certain amount of time. The amount of time is determined by static
attribute "wait_time". The waiting time starts off at 0.05s, meaning that the time 
diference between turning on two LEDs is 0.05s. After all LEDs have been turned on,
the wait time increases by 0.05s. After it reaches 0.2s it resets.
This is just to make it more interesting.*/
void interrupt_function(){    
    static int col_ord[27] = {1, 4, 2, 5, 3, 4, 5, 6, 7, 8, 2, 9, 3, 9, 1, 8, 7, 6, 5, 4, 3, 7, 1, 6, 2};
    static int row_ord[27] = {1, 2, 1, 2, 1, 3, 3, 3, 3, 3, 2, 1, 2, 3, 2, 1, 1, 1, 1, 1, 3, 2, 3, 2, 3};
    static float wait_time = 0.05;
    for(int i=0; i<27; i++){
            turn_LED_on(row_ord[i]-1, col_ord[i]-1);
            wait(wait_time);
    }
    if (wait_time < 0.2)
        wait_time += 0.05;
    else
        wait_time = 0.05;
}


void write_one(){
    static int col_ord[5] = {2,6,3,6,1};
    static int row_ord[5] = {1,3,2,1,3};
    for(int i=0; i<5; i++){
            turn_LED_on(row_ord[i]-1, col_ord[i]-1);
    }
    turn_off_all_LEDs();
}

void write_zero(){
    static int col_ord[9] = {2,5,7,9,9,7,5,7,6};
    static int row_ord[9] = {1,3,3,1,3,1,1,2,2};
    for(int i=0; i<9; i++){
            turn_LED_on(row_ord[i]-1, col_ord[i]-1);
    }
    turn_off_all_LEDs();
}

void callbackfunction(){
    static int which_state = 0;
    if (which_state == 0){
        write_zero();
        which_state = 1;
    }
    else{
        write_one();
        which_state = 0;
    }
}

// Even though we could have done this simple code without any functions or an interrupt
// routine, the aim of this code is to demonstrate how these things work. The main function
//is only used to create an infinite loop.
int main(){
    Initialize();
    Ticker t;
    t.attach(callbackfunction, 1);
    while(1){   
    }
}
