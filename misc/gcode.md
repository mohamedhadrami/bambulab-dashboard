# GCODE Commands

## Movement
**Home**
```gcode
G28 \n
```

### Toolhead
**x+1**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 X1.0 F9000 \n
M1002 pop_ref_mode \n
M211 R \n        
```

**x+10**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 X10.0 F9000 \n
M1002 pop_ref_mode \n
M211 R \
```

**x-1**
```gcode
M211 S\n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 X-1.0 F9000 \n
M1002 pop_ref_mode \n
M211 R \n
```

**x-10**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 X-10.0 F9000 \n
M1002 pop_ref_mode \n
M211 R \n
```

**y+1**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 Y1.0 F9000 \n
M1002 pop_ref_mode \n
M211 R \n
```

**y+10**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 Y10.0 F9000 \n
M1002 pop_ref_mode \n
M211 R \n
```

**y-1**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 Y-1.0 F9000 \n
M1002 pop_ref_mode \n
M211 R \n
```

**y-10**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 Y-10.0 F9000 \n
M1002 pop_ref_mode \n
M211 R \n
```


### Bed
**z+10**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 Z-10.0 F1800 \n
M1002 pop_ref_mode \n
M211 R \n

```

**z+1**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 Z-1.0 F1800 \n
M1002 pop_ref_mode \n
M211 R \n

```

**z-1**
```gcode
M211 S \n
M211 X1 Y1 Z1\n
M1002 push_ref_mode \n
G91 \n
G1 Z1.0 F1800 \n
M1002 pop_ref_mode \n
M211 R \n

```

**z-10**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 Z10.0 F1800 \n
M1002 pop_ref_mode \n
M211 R \n

```

### Extruder (Purge)
**Down**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
M83 \n
G1 E5.0 F150 \n
M1002 pop_ref_mode \n
M211 R \n

```

**Up**
```gcode
M211 S \n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
M83 \n
G1 E-5.0 F150 \n
M1002 pop_ref_mode \n
M211 R \n

```

## Temperature

**Nozzle Target**\
TEMP is a float, (S50.00 for 50C)
```gcode
M104 S<TEMP> \n
```

**Bed Target**\
TEMP is a float, (S50.00 for 50C)
```gcode
M140 S<TEMP> \n
```

**Toolhead Fan**\
PERCENT is an 8-bit integer value used to map the speed of the fan, where 100% is 255 and 0% is 0
```gcode
M106 P1 S<PERCENT> \n
```

PERCENT is an 8-bit integer value used to map the speed of the fan, where 100% is 255 and 0% is 0
**Auxilary Fan**
```gcode
M106 P2 S<PERCENT> \n
```

**Chamber Fan**\
PERCENT is an 8-bit integer value used to map the speed of the fan, where 100% is 255 and 0% is 0
```gcode
M106 P3 S<PERCENT> \n
```




## Filament


## TODO
command: extrusion_cali_set
happens when filament is fed into ams
