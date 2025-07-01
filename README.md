# simply curious
https://giulianocrucio.github.io/My_web/


IDEA:

I could implement a hardcoded solution (like activating the right and left thrusters just to keep it "upright") with the addition of a stabilization brain that "smooths out the issues."

Something like:

rocket.central_force((output of the hardcoded software) + (output of the NNs))  

where the NNs are trained with a GA and handle:
- Keeping the rocket at a certain x-position
- Ensuring a soft landing

Maybe this dual approach saves me some training time, even if it loses a bit of adaptability.

pseudocode exemple:

function stabilizer(){  
    angle = rocket's direction  
    ang_vel = rocket's angular velocity  

    left_force and central_force scaled in some way based on  
    the rocket's angular velocity and direction  
}  