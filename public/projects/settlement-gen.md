# About
The time-line procedural settlement generator is a procedural settlement simulation. The simulation allows users to choose the starting parameters of their settlement, and grows a settlement procedurally over time. This game/simulation was the basis of my MSc by Research thesis, combining the procedural generation of both rural and urban settlements. This also formed part of a paper accepted to Cyberworlds 2017 (CW2017).

## Technical details
The simulation was developed in the Unity games engine, however, the approach can be generalised to other platforms. Prior to our paper, the majority of city generation approaches largely focused on dense grid-based road networks. This works well for large urban cities, but not so great for small settlements such as towns and villages. It is with this motivation in mind that we authored a novel approach, focusing on small settlements and a variety of different architectural styles in road network design.

The approach is formed of five main stages:

- Settlement seeding: The starting position of the settlement is chosen, along with seed positions. 
- Historical time-line: A variety of parameters are specified to define how the road network is grown chronologically throughout the simulation. The network is grown according to these parameter sets.
- Parcelisation: Once the road network is grown stochastically, we utilise a novel parcellisation algorithm to produce land parcels alongside the roads.
- Building placement: Parcels are iterated over and buildings are procedurally placed, oriented to the adjacent road.
- Fauna: Additional fauna is added around the scene.

If you are interested in more technical details, please see our paper linked below, which provides a comprehensive description of the algorithm and the varying stages of development. Alternatively, drop me a line with any specific queries. 🙂

## Other media
- [Link to paper](https://core.ac.uk/download/pdf/146470843.pdf)
- [YouTube Video](https://www.youtube.com/watch?v=SGFdx4swD2I)