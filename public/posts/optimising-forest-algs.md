# Procedural Content Generation
One area which remains a fascinating research topic to me concerns algorithms for Procedural Content Generation (PCG). PCG largely concerns the automatic and algorithmic generation of content, for games, media, and much more. For example, the procedural generation of 3D buildings would concern how 3D buildings can be automatically generated, as opposed to a manual design approach. PCG has a number of benefits, but the primary motivator for its use in games regards the lack of a manual design approach -- development times are reduced, a large amount of content can be generated in an instant, etc. Lots of examples can be found on the [/r/proceduralgeneration](https://www.reddit.com/r/proceduralgeneration/?rdt=38901) subreddit if you are interested in some more concrete examples.

A number of articles I have published throughout my career novel procedural generation approaches. In fact, in my second year of my bachelor's degree, I started work on my first paper -- the procedural generation of virtual forests.

## Procedural Forestry
Generating a virtual forest is actually quite easy. The easiest approach is to sample a bunch of random points in some closed space, and then distribute trees according to these sampled points. For example, consider the following C++. This is a simple pseudo-random number generator:

```cpp
//Properties for the RNG
std::random_device device;
std::mt19937 randomGenerator(device());

class Random
{
public:
    /// <summary>
    /// Returns a random float between {min} and {max}
    /// </summary>
    template <typename T> requires std::is_floating_point_v<T>
    static T Range(const T& min, const T& max)
    {
        //We have to do this because if the ranges aren't
        //ordered then C++ will throw an error
        float trueMin = std::min(min, max);
        float trueMax = std::max(max, min);

        //Build a uniform distribution
        std::uniform_real_distribution<T> udist(trueMin, trueMax);

        //Sample the distribution using the generator
        return (T)udist(randomGenerator);
    }

    /// <summary>
    /// Returns a random integer between {min} and {max}
    /// </summary>
    template <typename T> requires std::is_integral_v<T>
    static T Range(const T& min, const T& max)
    {
        return (T)Random::Range((float)min, (float)max);
    }
};
```

We can then use this to produce random coordinates:

```cpp
/// <summary>
/// Represents a 2-component vector (x, y)
/// </summary>
typedef struct Vector2
{
    float x;
    float y;
} Vector2;

/// <summary>
/// Generates a random point in the unit square
/// </summary>
Vector2 RandomPointInUnitSquare()
{
    return Vector2 
    { 
        Random::Range(0.0f, 1.0f),
        Random::Range(0.0f, 1.0f)
    };
}
```

We could use `RandomPointInUnitSquare()` to generate a number of pseudo-random points and then spawn trees at these sampled positions. This is perhaps the easiest and least-computational method of producing a virtual forest, with respect to the generative process. But does this produce nice, realistic looking forests?

We previous considered this in [our paper](https://www.mdpi.com/2073-431X/9/1/20), and we found that actually it really depends on the perspective you're viewing the forest from. If you're situated within the virtual forest, it doesn't really matter -- pseudo-random uniform distributions produce forests which look believable. However, if you're viewing the distribution from above, it does matter. We found that:

- Participants seem to like tightly-clustered dense distributions with equidistant spacing between tree instances.
- Participants consider large open clearings to be a fundamental component of generated forestry.
- Algorithms which are not pure pseudo-random distributions generally receive a higher degree of perceived believability.

In our paper, we compared three algorithms: a pseudo-random uniform distribution, a bio-inspired plant competition model and a hybrid approach. We found that generally, the plant competition model produced more believable forestry from a top-down perspective. So problem solved right? Plant competition models are the best? Unfortunately not.

## Plant competition models and their problems
A plant competition model essentially involves the individual simulation of each tree in the forest. Plants can grow, spread their seed, age and die within the forest. There is also a simulated level of competition between plants for resources. We find this in nature; plants in close proximity compete for soil moisture and sunlight. Plants which are larger can occlude sunlight to smaller plants, limiting their growth and potentially killing them off. Plant competition models embody this principle: trees in a forest are individual simulated, and compete for resources with each other.

The issue with this is the complexity of simulating forests with software:

- Forests potentially have hundreds of thousands of trees in them. Individually simulating this many trees in real-time is a considerable task.
- For a given tree T, it has to look up potentially every other tree to find trees local to it. This yields a naive time complexity of O(n^2); which is *drastically* slow.

Plant competition models are slow, but that is fine for ecologists and those interested in simulating them for predicting forest growth. They can press "Simulate" and come back after a few hours; offline simulation is fine in this regard. But what if we want to simulate this in real-time? What if we want to simulate forest growth in real-time, to add to immersive virtual worlds? What if we wanted to simulate forest development in games, which are by their design, real-time applications?

It is with this motivation in mind that my latest paper, submitted to CGVC'24, covers an optimisation strategy in a popular games engine to make this process blisteringly fast.

# Optimisation strategy
In our recent paper, we looked at optimising an asymmetric plant competition model typically used in generating virtual forestry. Our optimisation strategy focused primarily on two things:

- The utilisation of an Entity-Component System (ECS), a data-oriented approach for vectorising computation and parallelising it easily.
- A uniform spatial hashing method, in tandem with the ECS.

We chose the popular Unity games engine to implement our approach as it has a fully-fledged ECS built into it, and offers native unmanaged containers (like `NativeParalellMultiMashMap<T, U>` for easy spatial hashing.

## Burstifying everything
Unity's ECS works well with Burst, and the Unity C# job scheduling system. Burst is a way of compiling C# down to native instructions, rather than Intermediary Language (IL) bytecode. Why? Put simple, native instructions are *quick*. IL bytecode in comparison requires a run-time or service which interpret the IL code down to native instructions for your particular platform. For example, if your C# code is:

```cs
int result = add(10, 15);
```

It's CIL (Common Intermediate Language) would be:

```cil
ldc.i4.10                       # Pushes 10 onto the stack as a 4 byte int (i4)
ldc.i4.15                       # Pushes 15 onto the stack as a 4 byte int (i4)

call int32 add(int32, int32)    # Calls the add function on the two args passed

stloc.0                         # Pop stack (result) into variable result 

```

Which could be compiled down to the following x86 instructions:

```asm
add(int, int):
    push rbp                    # Save where we need to pop back to on stack
    mov rbp, rsp                # Set new base address for frame
    mov DWORD PTR [rbp-4], edi  # Allocate 4 bytes of stack mem for arg1, move EDI into it
    mov DWORD PTR [rbp-8], esi  # Do the same but for second arg, move ESI
    mov edx, DWORD PTR [rbp-4]  # Move first arg into EDX
    mov eax, DWORD PTR [rbp-8]  # Move second arg into EAX
    add eax, edx                # Add EDX to EAX, EAX will contain result
    pop rbp                     # Pop back to where we were on the stack
    ret                         # Return: jumps back to where we were

mov esi, 15                     # Load ESI with 15
mov edi, 10                     # Load EDI with 10
call add(int, int)              # Call add function
mov DWORD PTR[rbp-4], eax       # Move result (in EAX) to new space in stack mem
```

Burst enables us to skip the IL step, meaning that an intermediary format is not used. Instead, native instructions are generated for the underlying C# code, which makes it blazingly fast. Burst is also very easy to use. You simply use attributes to mark constructs to be compiled down to native x86 with `[BurstCompile]`. For example, here is a C# job that we compile with Burst to cull trees who are marked as dead:

```cs
[BurstCompile]
public partial struct CullDeadTreesJob : IJobEntity
{
    public EntityCommandBuffer.ParallelWriter ecb;

    public void Execute([ChunkIndexInQuery] int chunkIndex, in TreeComponent tree, in Entity entity)
    {
        //This culls trees whose m_needsCull member is set to true
        if(tree.m_needsCull)
            ecb.DestroyEntity(chunkIndex, entity);
    }
}
```


## Jobifying everything
One crucial component of building efficient approaches with ECS is Unity's C# job system. Unity's C# job system (referred to herein as "the job system") enables computational tasks to be distributed amongst several threads for parallelisation. You must be thinking *"hmm Ben, that sounds an awful lot like a thread pool"* -- and you'd be right. The job system is similar to a thread pool in the sense that:

- Computation is distributed amongst a collection of *n* threads.
- Interaction with the system is abstracted away from the nitty-gritty: you simply *schedule* a job and it magically gets distributed, in the same way that a thread pool assigns worker threads.
- Computation can be parallelised, or optionally, serialised.
- Jobs are described with an `Execute()` method which is parallelised across many threads, similar to an indirect callback being passed via a thread pool execution request.

The job system does a good job (pun intended) of abstracting away from the details of how computation is distributed, whilst offering a friendly interface to programmers. When working with Unity's ECS, you can have several job types. Here are a few:

- `IJob`: The base interface for jobs, not specific to any ECS parallelisation.
- `IJobEntity`: The job is parallelised across all entities in the world, e.g. all 10,000 entities are distributed amongst *n* threads, each of which process a batch of entities via iteration.
- `IJobParallelFor`: A generalised job for performing the same operation for each element of a container (a parallelised `foreach`) or for a fixed number of iterations (a parallelised `for`).

In our approach we largely utilise `IJobEntity` as we perform most of our calculations on a per-entity basis. For example, aging trees requires iteration over all entities and adding one to their age variable. This can be achieved by using `IJobEntity`.

## Job structure
We have several jobs which enables the super fast simulation of virtual forestry by leveraging the ECS and spatial hashing. Although jobs are parallelised, their order and execution is synchronised carefully to ensure the correct functioning of our approach. For example, the spatial hashing job runs before most of the jobs which simulate individual trees. If this order was negated, things would go drastically wrong. 

These are the steps we took, and the order in which they are executed for each iteration of the overarching `ISystem` instance:

- **On the first step of the simulation**: A `SpawnTreesJob` instance is initialised and executed in parallel. This job spawns an initial number of trees randomly into the environment, for further simulation. This is because forestry simulation algorithms are predicated on the existence of trees initially in the world.
- **Build entity queries & frame Entity-Command Buffer (ECB)**: Before any jobs are run, we build queries for calculating what tree entities are in the world. We also create an ECB to perform parallelised structural changes (such as adding/removing trees) at a later point. Here we also create the frame's `NativeParallelMultiHashMap<int, int>` which will be used in spatial hashing.
- **AssignSpatialIndexJob**: Tree entities are iterated over via an `IJobEntity` job and assigned a spatial hash according to a uniform grid. Details on this later.
- **CullDeadTreesJob**: Tree entities are iterated over in a similar fashion. The job removes dead trees if they were flagged as dead in the last frame.
- **UpdateTreesJob**: Each tree is aged, and flagged for removal if their age > a certain value. 
- **SpawnTreesJob**: Each tree in the simulation is considered for propogating new trees if their age > a certain value. If this condition is met, a random chance `c < t` is considered. If true, the tree creates a new tree entity randomly around its position.
- **FONCompetitionJob**: For each entity, uses the hashmap for neighbourhood lookups to see what trees are nearby this one. From this it then determines plant competition, thereby removing younger plants occluded from canopy cover.

## Spatial hashing
We also leverage spatial hashing, which is an obvious choice for optimising any type of agent-oriented simulation. Spatial hashing reduces the number of entities considered when calculating some metric. A classic application of this is in the boids algorithm to simulate flocking behaviour. As part of this algorithm, every entity in a boids algorithm has to look at the average heading of other entities in its neighbourhood. For this, it potentially needs to look at every other entity in the simulation. This grows exponentially as more and more agents are considered, with a time complexity of *O(n^2)*.

We can reduce this though, by only considering entities which are *approximate* to the entity in consideration. One way of doing this is cutting the world up into grid cells, and assigning each entity an cell index. They can then use this cell index to look up which other entities are in the same cell. This can be done with *O(1)* access time with a hashmap, with the hash being the assigned grid cell. This method of quantising a space into grid cells of the same size is known as *uniform* spatial hashing, as subdivision results in grid cells of a uniform length. A general formula for quantising space uniformly in 2D space can be seen below:

