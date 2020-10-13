# Commandline Validation
if [ $# -ne 7 ]
then
   echo " Usage "
   echo "./upload.sh <Astra Cluster ID> <Astra Region> <Asta Namespace> <Collection Name> <Astra username> <Astra Password> <parallelism> "
   exit 0;
fi

# Assign the command line values to variables

ClusterID=$1
AstraRegion=$2
AstraNamespace=$3
AstraCollections=$4
ClusterUsername=$5
ClusterPassword=$6
ParallelCalls=$7
AstraUUID=''
DocumentID=''

#echo ClusterID=$ClusterID 
#echo AstraRegion=$AstraRegion 
#echo AstraNamespace=$AstraNamespace 
#echo AstraCollections=$AstraCollections 
#echo AstraToken=$AstraToken
#echo ParallelCalls=$ParallelCalls

# Generate Auth Token
AstraUUID=uuidgen
AstraToken=`curl -X POST "https://$ClusterID-$AstraRegion.apps.astra.datastax.com/api/rest/v1/auth" -H  "accept: application/json" -H  "X-Cassandra-Request-Id: $AstraUUID" -H  "Content-Type: application/json" -d "{\"username\":\"$ClusterUsername\",\"password\":\"$ClusterPassword\"}" `
AstraToken=`echo $AstraToken | jq -r '.authToken'`

# echo AstraToken=$AstraToken


# Loading 
parallelCounter=0
for jsonDocument in `ls -l | grep $AstraCollections | awk ' { print $9 } '`
do 
	AstraUUID=uuidgen
	DocumentID=`jq -r '.id' $jsonDocument`
        curl -X PUT "https://$ClusterID-$AstraRegion.apps.astra.datastax.com/api/rest/v2/namespaces/$AstraNamespace/collections/$AstraCollections/$DocumentID?pretty=true" -H  "accept: application/json" -H  "X-Cassandra-Request-Id: $AstraUUID" -H  "X-Cassandra-Token: $AstraToken" -H  "Content-Type: application/json" --data @$jsonDocument &
        parallelCounter=`expr $parallelCounter + 1`
        if [ $parallelCounter -eq $ParallelCalls ]
        then
           parallelCounter=0
           wait
        fi
done
