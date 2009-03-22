#!/bin/bash
# Creates a 64-color palette for NCursesWindows.
# Output is C++ code and goes to;
#  ncpalette.hpp
#  ncpalette.cpp

colors="
BLACK
RED
GREEN
YELLOW
BLUE
MAGENTA
CYAN
WHITE
"

export colors
lccolors=$(echo $colors | tr '[A-Z]' '[a-z]') 


ocpp=ncpalette.cpp
ohpp=ncpalette.hpp
echo '' > $ocpp
echo '' > $ohpp


export colors # needed for sed, below

cat <<EOF >> $ohpp
#ifndef teeny_NCPALETTE_HPP_INCLUDED
#define teeny_NCPALETTE_HPP_INCLUDED 1
#include <ncurses.h>
#include <string>
#include <algorithm> // transform()

// auto-generated code: do not edit this file, but edit $0 instead.
// Expected to be included by client code using NCursesWindows, if
// they need these functions.

/***

The functions in this file are related to curses attributes. We
attempt to provide a friendlier interface for client apps which want
to manipulate attributes, particularly by name.

***/
namespace {} // make sure doxygen does not assign the above docs to namespace teeny.


////////// TODO: get rid of these COLOR_PAIR_fg_ON_bg macros, now that
//////////       we have color_pairnum_for_names().
EOF


{

    echo
    bgndx=1
    for BG in $colors; do
	echo "#define COLOR_BG_PALETTE_${BG} ($bgndx)"
	bgndx=$((bgndx + 8))
	c=0
	for FG in $colors; do
	    echo "#define COLOR_PAIR_${FG}_ON_${BG} COLOR_PAIR(COLOR_BG_PALETTE_${BG} + $c)"
	    c=$((c + 1))
	done
	echo
    done
} > /dev/null


cat <<EOF >> $ohpp

namespace ncutil {
/*****
    Sets up a full 64-color palette. Note that NCursesWindow uses
    the global functions and stdscr for setting up colors, so
    the colors set up here affect all linked-in curses code
    which uses COLOR_PAIR(number).

    For each BG/FG combination of the following colors:

    $(echo $colors | sed -e 's|^|COLOR_|;s| |\n    COLOR_|g')

    in that order, A palette entry is made. The entries
    are grouped by background, not foreground. That is,
    colors 1..7 habe a bg of COLOR_BLACK, 8..15 have
    a bg of COLOR_RED, etc...

    The full list of colors is here:

<pre>
EOF

c=0
for BG in $colors; do
    echo
    echo "Background $BG:"
    for FG in $colors; do
	c=$((c + 1))
	echo "$c = $FG on $BG"
    done
done >> $ohpp

cat <<EOF >> $ohpp
</pre>

*****/

void install_full_palette();

/****

color_pairnum_for_names() accepts to string-form color names, forground
and background color, and tries to find a matching COLOR_PAIR number.
It returns 0 if it does not find a match. The color names are
case-insensitive, and must be one of:

$colors

You can get the curses attribute values from the return value by passing
it to the curses COLOR_PAIR(pairnumber) macro.

****/

short color_pairnum_for_names( const std::string & fore, const std::string & back );

/**
unsigned long color_pair() returns the same as COLOR_PAIR(color_pairnum_for_names(fore,back)),
or returns 0 if no such pair is found.
*/
unsigned long color_pair( const std::string & fore, const std::string & back );

} // namespace ncutil

#endif // teeny_NCPALETTE_HPP_INCLUDED

EOF

cat <<EOF >> $ocpp
// auto-generated. edit at own risk.
#include <map>
#include <utility> // pair
#include "ncpalette.hpp"
#include <ncurses.h>
namespace ncutil {
void install_full_palette()
{
EOF

c=0
for BG in $colors; do
    for FG in $colors; do
	c=$((c + 1))
	echo -e "\t::init_pair($c,COLOR_${FG},COLOR_${BG});"
    done
done >> $ocpp

cat <<EOF >> $ocpp
} // install_full_palette()

short color_pairnum_for_names( const std::string & f,
			    const std::string & b )
{
    std::string fore = f;
    std::string back = b;
    std::transform( fore.begin(), fore.end(), fore.begin(), (int(*)(int)) std::toupper );
    std::transform( back.begin(), back.end(), back.begin(), (int(*)(int)) std::toupper );
    typedef std::pair<std::string,std::string> SP;
    typedef std::map< SP, short > MT;
    static MT bob;
    if( bob.empty() )
    {
EOF

c=1
for BG in $colors; do
    for FG in $colors; do
	#echo -e "\t\tbob[SP(\"${FG}\",\"${BG}\")] = COLOR_PAIR(${c});";
	echo -e "\t\tbob[SP(\"${FG}\",\"${BG}\")] = ${c};";
	c=$((c + 1))
    done
done >> $ocpp

cat <<EOF >> $ocpp
    } // bob.empty()?

    SP p(fore,back);
    MT::const_iterator cit = bob.find( p );

    return (bob.end() == cit) ? 0 : (*cit).second;

} // color_pairnum_for_names()

unsigned long color_pair( const std::string & fore, const std::string & back )
{
    short num = color_pairnum_for_names(fore,back);
    return (0 == num) ? 0 : COLOR_PAIR(num);
}

} // namespace ncutil
EOF

echo "Created $ocpp and $ohpp."
